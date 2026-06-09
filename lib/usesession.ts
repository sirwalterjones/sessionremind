// Server-side client for UseSession's private GraphQL API.
//
// IMPORTANT: this runs SERVER-SIDE only. The browser cannot call this API
// cross-origin (CORS), but server-to-server fetch has no CORS restriction.
//
// Auth: a non-expiring JWT the photographer captures once from their logged-in
// UseSession session (localStorage "session-token"), sent as the `authorization`
// header. Data model (reverse-engineered): viewer.flite(id) -> dates[FliteDate]
// -> slots[FliteSlot] -> client{name,email,phone}. See memory usesession-internal-api.

import { Booking } from './types'
import { parseSessionDate, formatSessionLabel } from './reminders'

const API_URL = 'https://api.usesession.com/query'

export interface ViewerInfo {
  id: string
  name: string
  email: string
  businessName: string
}

// The token comes from the browser's localStorage, which often stores it
// JSON-stringified — so the raw value can arrive wrapped in literal quotes
// (e.g. `"eyJ..."`) or even double-encoded. UseSession's JWT verifier rejects
// any such wrapper as `invalid token` (HTTP 401). Strip quotes/backslashes/
// whitespace (and unwrap repeated JSON-string encodings) to recover the bare JWT.
// A valid JWT never contains quotes/backslashes, so this can't over-strip.
export function sanitizeToken(raw: string): string {
  let t = (raw || '').trim()
  let prev = ''
  while (t !== prev) {
    prev = t
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      try {
        const parsed = JSON.parse(t)
        if (typeof parsed === 'string') {
          t = parsed.trim()
          continue
        }
      } catch {
        /* not valid JSON — fall through to manual strip */
      }
      t = t.slice(1, -1).trim()
    }
    t = t.replace(/^[\s\\]+|[\s\\]+$/g, '')
  }
  return t
}

async function gql<T = any>(
  token: string,
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string
): Promise<T> {
  const clean = sanitizeToken(token)
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      // UseSession's API requires "Authorization: Bearer <jwt>".
      authorization: clean.startsWith('Bearer ') ? clean : `Bearer ${clean}`,
    },
    body: JSON.stringify({ query, variables, operationName }),
  })
  if (!res.ok) {
    throw new Error(`UseSession API HTTP ${res.status}`)
  }
  const json = await res.json()
  if (json.errors && json.errors.length) {
    throw new Error('UseSession API error: ' + json.errors.map((e: any) => e.message).join('; '))
  }
  return json.data as T
}

// Validate a token and fetch the photographer's identity + business name
// (used to auto-fill the studio name, so nothing is hard-coded).
export async function fetchViewer(token: string): Promise<ViewerInfo> {
  const data = await gql<{ viewer: any }>(
    token,
    `query Viewer { viewer { id name email business_name } }`,
    undefined,
    'Viewer'
  )
  const v = data?.viewer
  if (!v?.id) throw new Error('Invalid UseSession token (no viewer)')
  return { id: v.id, name: v.name || '', email: v.email || '', businessName: v.business_name || '' }
}

// Discover the viewer field that returns a list of Flite (sessions). We captured
// the single-session field (`flite(id)`) but not the plural list field, so we
// resolve it once via introspection rather than hard-coding a guess.
export async function discoverListField(token: string): Promise<string | null> {
  try {
    const data = await gql<any>(
      token,
      `query Disco { __type(name: "User") { fields { name args { name } type { kind name ofType { kind name ofType { kind name } } } } } }`
    )
    const fields: any[] = data?.__type?.fields || []
    const returnsFliteList = (t: any): boolean => {
      // Walk LIST/NON_NULL wrappers looking for a Flite object.
      let cur = t
      let sawList = false
      for (let i = 0; i < 4 && cur; i++) {
        if (cur.kind === 'LIST') sawList = true
        if (cur.name === 'Flite') return sawList
        cur = cur.ofType
      }
      return false
    }
    // Prefer a no-required-args field that returns [Flite]; fall back to name match.
    const candidates = fields.filter((f) => returnsFliteList(f.type))
    if (candidates.length) {
      const noArgs = candidates.find((f) => !f.args || f.args.length === 0)
      return (noArgs || candidates[0]).name
    }
    const byName = fields.find((f) => /flites|sessions|upcoming/i.test(f.name))
    return byName?.name || null
  } catch (error) {
    console.error('discoverListField failed:', error)
    return null
  }
}

const FLITE_SELECTION = `
  id
  name
  session_type
  dates {
    id
    date
    meta_start_time_offset_minutes
    slots {
      id
      status
      is_noshow
      time_offset_start
      time_offset_end
      client { id name email phone }
    }
  }
`

// Convert a FliteDate + FliteSlot into an absolute Date.
// FliteDate.date is the calendar day; FliteSlot.time_offset_start is minutes
// into that day. (Timezone handling may need calibration against real data.)
function slotDateTime(fliteDate: any, slot: any): Date | null {
  const base = parseSessionDate(fliteDate?.date)
  if (!base) return null
  const offsetMin = Number(slot?.time_offset_start) || 0
  return new Date(base.getTime() + offsetMin * 60 * 1000)
}

function fliteToBookings(flite: any, now: Date): Booking[] {
  const out: Booking[] = []
  const title = flite?.name || flite?.session_type || 'Photography Session'
  for (const date of flite?.dates || []) {
    for (const slot of date?.slots || []) {
      // A slot with a client is a booking. Skip open slots and no-shows.
      if (!slot?.client || slot?.is_noshow) continue
      const when = slotDateTime(date, slot)
      if (!when || when.getTime() < now.getTime()) continue // only upcoming
      out.push({
        externalId: `usesession:slot:${slot.id}`,
        source: 'usesession',
        clientName: slot.client.name || '',
        phone: slot.client.phone || '',
        email: slot.client.email || '',
        sessionTitle: title,
        sessionDateISO: when.toISOString(),
        sessionTimeLabel: formatSessionLabel(when),
      })
    }
  }
  return out
}

// Fetch one session's bookings by Flite id (confirmed-working query shape).
export async function fetchBookingsForFlite(token: string, fliteId: string, now = new Date()): Promise<Booking[]> {
  const data = await gql<{ viewer: { flite: any } }>(
    token,
    `query Session($id: ID!) { viewer { flite(id: $id) { ${FLITE_SELECTION} } } }`,
    { id: fliteId },
    'Session'
  )
  return fliteToBookings(data?.viewer?.flite, now)
}

// Fetch all upcoming bookings across the photographer's sessions.
// `listField` is the discovered viewer list field (e.g. "flites").
export async function fetchUpcomingBookings(
  token: string,
  listField: string,
  now = new Date()
): Promise<Booking[]> {
  if (!listField) throw new Error('UseSession list field not resolved — run discovery first')
  const data = await gql<{ viewer: any }>(
    token,
    `query UpcomingSessions { viewer { ${listField} { ${FLITE_SELECTION} } } }`,
    undefined,
    'UpcomingSessions'
  )
  const flites: any[] = data?.viewer?.[listField] || []
  return flites.flatMap((f) => fliteToBookings(f, now))
}
