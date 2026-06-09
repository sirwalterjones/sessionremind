import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  TenantBusiness,
  getTenantBusiness,
  setTenantBusiness,
  getTenantSmsSender,
} from '@/lib/settings'

// Self-service: the photographer enters only their BUSINESS IDENTITY (needed
// because the toll-free number is registered to their business). The opt-in /
// consent details are standardized platform-side, so they're not asked here.
// Saving does NOT spend money.

const REQUIRED: (keyof TenantBusiness)[] = [
  'legalName',
  'website',
  'addressStreet',
  'addressCity',
  'addressState',
  'addressZip',
  'contactFirstName',
  'contactLastName',
  'contactEmail',
  'contactPhone',
]

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [business, sender] = await Promise.all([
    getTenantBusiness(user.id),
    getTenantSmsSender(user.id),
  ])
  return NextResponse.json({ business, sender })
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const str = (v: any) => (v == null ? '' : String(v).trim())
  const biz: TenantBusiness = {
    legalName: str(body.legalName).slice(0, 120),
    website: str(body.website).slice(0, 200),
    addressStreet: str(body.addressStreet).slice(0, 200),
    addressCity: str(body.addressCity).slice(0, 100),
    addressState: str(body.addressState).slice(0, 60),
    addressZip: str(body.addressZip).slice(0, 20),
    addressCountry: (str(body.addressCountry) || 'US').slice(0, 2).toUpperCase(),
    contactFirstName: str(body.contactFirstName).slice(0, 80),
    contactLastName: str(body.contactLastName).slice(0, 80),
    contactEmail: str(body.contactEmail).toLowerCase().slice(0, 160),
    contactPhone: str(body.contactPhone).slice(0, 24),
    updatedAt: new Date().toISOString(),
  }

  const missing = REQUIRED.filter((k) => !str((biz as any)[k]))
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(biz.contactEmail)) {
    return NextResponse.json({ error: 'Please enter a valid contact email.' }, { status: 400 })
  }
  if (!/^https?:\/\//i.test(biz.website)) {
    biz.website = `https://${biz.website}`
  }

  await setTenantBusiness(user.id, biz)
  return NextResponse.json({ success: true, business: biz })
}
