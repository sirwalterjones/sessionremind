// Transactional email via Resend's REST API (no SDK dependency).
// No-ops if RESEND_API_KEY isn't set, so signups never break before email is
// configured. Set RESEND_FROM to a verified-domain sender once your domain is
// verified in Resend.

const FROM = process.env.RESEND_FROM || 'SessionRemind <onboarding@resend.dev>'

// Emails stay light for client compatibility, but carry the Ink & Acid brand:
// graphite ink, lime CTA fills (dark text on lime), deep-lime eyebrow text.
const INK = '#101113'
const ACCENT = '#4D7C0F' // deep lime — readable as TEXT on white
const LIME = '#C6F24E' // acid lime — FILLS only, with dark text
const LIME_INK = '#11130A'
const MUTED = '#5F646C'
const HAIRLINE = '#E4E6E2'
const PAPER = '#F2F4EF'

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('sendEmail: RESEND_API_KEY not set — skipping')
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    if (!res.ok) {
      console.error('Resend send failed:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (e) {
    console.error('Resend send error:', e)
    return false
  }
}

// A bulletproof, table-based pill button (renders in Outlook too).
function button(text: string, url: string): string {
  return `
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 4px">
    <tr>
      <td align="center" bgcolor="${LIME}" style="border-radius:999px">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 30px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;line-height:1;color:${LIME_INK};text-decoration:none;border-radius:999px">
          ${text}
        </a>
      </td>
    </tr>
  </table>`
}

interface BrandedEmailOpts {
  preheader: string
  eyebrow?: string
  heading: string
  // Inner body HTML (paragraphs etc.) placed under the heading and above the CTA.
  bodyHtml: string
  ctaText?: string
  ctaUrl?: string
  // Small print under the CTA (e.g., fallback link, expiry note).
  afterCtaHtml?: string
}

// One shared, on-brand HTML shell for every transactional email.
export function renderBrandedEmail(o: BrandedEmailOpts): string {
  const sans = '-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
  const mono = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${o.heading}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">${o.preheader}</span>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;">

          <!-- Logo lockup -->
          <tr>
            <td style="padding:4px 4px 20px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:${LIME};border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;font-family:${sans};font-weight:700;font-size:14px;color:${LIME_INK};">Sr</td>
                  <td style="padding-left:10px;font-family:${sans};font-weight:600;font-size:17px;color:${INK};">SessionRemind</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid ${HAIRLINE};border-radius:16px;padding:40px;">
              ${
                o.eyebrow
                  ? `<div style="font-family:${mono};text-transform:uppercase;letter-spacing:0.16em;font-size:11px;color:${ACCENT};margin:0 0 14px;">${o.eyebrow}</div>`
                  : ''
              }
              <h1 style="margin:0 0 14px;font-family:${sans};font-size:26px;line-height:1.15;font-weight:700;color:${INK};letter-spacing:-0.02em;">${o.heading}</h1>
              <div style="font-family:${sans};font-size:15px;line-height:1.65;color:${MUTED};">${o.bodyHtml}</div>
              ${o.ctaText && o.ctaUrl ? `<div style="margin-top:26px;">${button(o.ctaText, o.ctaUrl)}</div>` : ''}
              ${
                o.afterCtaHtml
                  ? `<div style="margin-top:26px;padding-top:22px;border-top:1px solid ${HAIRLINE};font-family:${sans};font-size:12px;line-height:1.6;color:#9A958C;">${o.afterCtaHtml}</div>`
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 8px 8px;font-family:${mono};font-size:11px;line-height:1.7;letter-spacing:0.1em;text-transform:uppercase;color:#A7A29A;">
              SessionRemind · SMS &amp; E-mail Reminders for Sessions
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px;font-family:${sans};font-size:11px;line-height:1.6;color:#B5B0A8;">
              You received this because someone used this address to sign up at sessionremind.com.
              <br>Not affiliated with Session Technologies, LLC.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// A branded email reminder sent alongside the SMS. `body` is the already-
// rendered reminder text (same copy as the SMS).
export async function sendReminderEmail(to: string, studioName: string, body: string): Promise<boolean> {
  const html = renderBrandedEmail({
    preheader: body.slice(0, 120),
    eyebrow: 'Session reminder',
    heading: 'A friendly reminder',
    bodyHtml: `<p style="margin:0;white-space:pre-line;">${escapeHtml(body)}</p>`,
  })
  return sendEmail(to, `Reminder from ${studioName || 'your photographer'}`, html)
}

export async function sendVerificationEmail(to: string, link: string): Promise<boolean> {
  const html = renderBrandedEmail({
    preheader: 'Confirm your email to finish setting up SessionRemind.',
    eyebrow: 'Account setup',
    heading: 'Confirm your email',
    bodyHtml: `<p style="margin:0;">Tap the button below to verify your email and finish setting up your SessionRemind account.</p>`,
    ctaText: 'Verify email',
    ctaUrl: link,
    afterCtaHtml: `Button not working? Paste this link into your browser:<br><a href="${link}" style="color:${MUTED};word-break:break-all;">${link}</a><br><br>This link expires in 24 hours. If you didn’t sign up, you can safely ignore this email.`,
  })
  return sendEmail(to, 'Verify your SessionRemind email', html)
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<boolean> {
  const html = renderBrandedEmail({
    preheader: 'Use this link to choose a new SessionRemind password.',
    eyebrow: 'Account access',
    heading: 'Reset your password',
    bodyHtml: `<p style="margin:0;">Someone (hopefully you) asked to reset the password for this SessionRemind account. Tap the button below to choose a new one.</p>`,
    ctaText: 'Choose a new password',
    ctaUrl: link,
    afterCtaHtml: `Button not working? Paste this link into your browser:<br><a href="${link}" style="color:${MUTED};word-break:break-all;">${link}</a><br><br>This link expires in 1 hour and can be used once. If you didn’t ask for this, you can safely ignore it — your password won’t change.`,
  })
  return sendEmail(to, 'Reset your SessionRemind password', html)
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://sessionremind.com'

// Format a US E.164 number as (XXX) XXX-XXXX for display; pass through otherwise.
function prettyUsNumber(e164?: string): string {
  if (!e164) return ''
  const d = e164.replace(/[^\d]/g, '')
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d
  if (ten.length !== 10) return e164
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}

// Sent (once) when a tenant's dedicated toll-free verification is APPROVED.
export async function sendTollfreeApprovedEmail(
  to: string,
  studioName: string,
  phoneNumber?: string
): Promise<boolean> {
  const pretty = prettyUsNumber(phoneNumber)
  const numLine = pretty
    ? ` <strong style="color:${INK};">${escapeHtml(pretty)}</strong>`
    : ''
  const html = renderBrandedEmail({
    preheader: 'Your dedicated texting number is verified and live.',
    eyebrow: 'Dedicated number approved',
    heading: 'Your texting number is live',
    bodyHtml:
      `<p style="margin:0 0 12px;">Great news${studioName ? `, ${escapeHtml(studioName)}` : ''} — carrier verification is complete. ` +
      `Your reminders now send from your own dedicated toll-free number${numLine}.</p>` +
      `<p style="margin:0;">There's nothing else to do. Scheduled reminders will automatically start sending from your number.</p>`,
    ctaText: 'Open your dashboard',
    ctaUrl: `${BASE}/connect`,
  })
  return sendEmail(to, 'Your SessionRemind texting number is live', html)
}

// Sent (once) when a tenant's dedicated toll-free verification is REJECTED.
export async function sendTollfreeRejectedEmail(
  to: string,
  studioName: string,
  reason?: string
): Promise<boolean> {
  const reasonBlock = reason
    ? `<p style="margin:0 0 12px;padding:12px 14px;background:${PAPER};border-radius:10px;color:${INK};white-space:pre-line;">${escapeHtml(reason)}</p>`
    : ''
  const html = renderBrandedEmail({
    preheader: 'Your dedicated number needs a quick fix.',
    eyebrow: 'Action needed',
    heading: 'Your number needs a quick fix',
    bodyHtml:
      `<p style="margin:0 0 12px;">The carrier couldn't approve your dedicated texting number just yet${reason ? ':' : '.'}</p>` +
      reasonBlock +
      `<p style="margin:0;">Don't worry — your reminders are still going out from our shared number in the meantime, so nothing is interrupted. Reply to this email or contact support and we'll help you get it sorted.</p>`,
    ctaText: 'Review details',
    ctaUrl: `${BASE}/connect`,
    afterCtaHtml: `Questions? Email <a href="mailto:support@sessionremind.com" style="color:${MUTED};">support@sessionremind.com</a>.`,
  })
  return sendEmail(to, 'Your SessionRemind number needs a quick fix', html)
}

// Where new contact/support tickets are announced. Handled in /admin/support;
// this email is just the heads-up.
const SUPPORT_NOTIFY_EMAIL = process.env.SUPPORT_NOTIFY_EMAIL || 'walterjonesjr@gmail.com'

const TOPIC_LABELS: Record<string, string> = {
  support: 'Support',
  billing: 'Billing',
  bug: 'Bug report',
  general: 'General',
}

// Notify the operator that a new contact/support ticket arrived.
export async function sendSupportNotificationEmail(ticket: {
  id: string
  name: string
  email: string
  topic: string
  message: string
  username?: string
}): Promise<boolean> {
  const html = renderBrandedEmail({
    preheader: `${ticket.name}: ${ticket.message.slice(0, 100)}`,
    eyebrow: `New ${TOPIC_LABELS[ticket.topic] || 'support'} request`,
    heading: `Message from ${escapeHtml(ticket.name)}`,
    bodyHtml:
      `<p style="margin:0 0 6px;"><strong style="color:${INK};">From:</strong> ${escapeHtml(ticket.name)} &lt;${escapeHtml(ticket.email)}&gt;${ticket.username ? ` · account: ${escapeHtml(ticket.username)}` : ''}</p>` +
      `<p style="margin:0 0 12px;"><strong style="color:${INK};">Topic:</strong> ${TOPIC_LABELS[ticket.topic] || ticket.topic}</p>` +
      `<p style="margin:0;padding:12px 14px;background:${PAPER};border-radius:10px;color:${INK};white-space:pre-line;">${escapeHtml(ticket.message)}</p>`,
    ctaText: 'Open in admin panel',
    ctaUrl: `${BASE}/admin/support`,
  })
  return sendEmail(
    SUPPORT_NOTIFY_EMAIL,
    `[SessionRemind] ${TOPIC_LABELS[ticket.topic] || 'Support'}: ${ticket.name}`,
    html
  )
}

// Send the admin's reply to the requester.
export async function sendSupportReplyEmail(
  to: string,
  name: string,
  originalMessage: string,
  reply: string
): Promise<boolean> {
  const html = renderBrandedEmail({
    preheader: reply.slice(0, 120),
    eyebrow: 'Support reply',
    heading: `Hi ${escapeHtml(name)},`,
    bodyHtml:
      `<p style="margin:0 0 16px;white-space:pre-line;">${escapeHtml(reply)}</p>` +
      `<p style="margin:0 0 6px;font-size:13px;color:${MUTED};">You wrote:</p>` +
      `<p style="margin:0;padding:12px 14px;background:${PAPER};border-radius:10px;font-size:13px;color:${MUTED};white-space:pre-line;">${escapeHtml(originalMessage)}</p>`,
    afterCtaHtml: `Need to add more? <a href="${BASE}/contact" style="color:${MUTED};">Reply through our contact page</a> and we'll pick the thread right back up.`,
  })
  return sendEmail(to, 'Re: your SessionRemind support request', html)
}
