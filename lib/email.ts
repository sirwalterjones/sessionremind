// Transactional email via Resend's REST API (no SDK dependency).
// No-ops if RESEND_API_KEY isn't set, so signups never break before email is
// configured. Set RESEND_FROM to a verified-domain sender once your domain is
// verified in Resend; until then Resend test mode only delivers to the account
// owner's address.

const FROM = process.env.RESEND_FROM || 'SessionRemind <onboarding@resend.dev>'

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

export async function sendVerificationEmail(to: string, link: string): Promise<boolean> {
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:8px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      <span style="display:inline-flex;width:30px;height:30px;border-radius:8px;background:#141414;color:#fff;font-weight:700;align-items:center;justify-content:center">Sr</span>
      <span style="font-size:17px;font-weight:600;color:#141414">SessionRemind</span>
    </div>
    <h1 style="font-size:20px;color:#141414;margin:0 0 12px">Confirm your email</h1>
    <p style="font-size:14px;line-height:1.6;color:#5F5B54;margin:0 0 24px">
      Tap the button below to verify your email and finish setting up your SessionRemind account.
    </p>
    <a href="${link}" style="display:inline-block;background:#141414;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px">Verify email</a>
    <p style="font-size:12px;line-height:1.6;color:#9A958C;margin:24px 0 0">
      If the button doesn't work, copy this link:<br/><span style="color:#5F5B54;word-break:break-all">${link}</span>
    </p>
    <p style="font-size:12px;color:#9A958C;margin:16px 0 0">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
  </div>`
  return sendEmail(to, 'Verify your SessionRemind email', html)
}
