// Transactional email via Resend's REST API (no SDK dependency).
// No-ops if RESEND_API_KEY isn't set, so signups never break before email is
// configured. Set RESEND_FROM to a verified-domain sender once your domain is
// verified in Resend.

const FROM = process.env.RESEND_FROM || 'SessionRemind <onboarding@resend.dev>'

const INK = '#141414'
const ACCENT = '#DD4D24'
const MUTED = '#6E6A63'
const HAIRLINE = '#ECEAE4'
const PAPER = '#F4F2EE'

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
      <td align="center" bgcolor="${INK}" style="border-radius:999px">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 30px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:999px">
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
                  <td style="background:${INK};border-radius:8px;width:32px;height:32px;text-align:center;vertical-align:middle;font-family:${sans};font-weight:700;font-size:14px;color:#ffffff;">Sr</td>
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
