import { Resend } from 'resend'

// Guard against missing key in local dev (key only exists on Vercel)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const FROM_EMAIL = 'KDP Cover AI <updates@kdpcoverai.site>'
export const REPLY_TO   = 'support@kdpcoverai.site'
export const SITE_URL   = 'https://kdpcoverai.site'

// ─── Send a single email ──────────────────────────────────────────────────────
export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email to', opts.to)
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }
  try {
    const result = await resend!.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo ?? REPLY_TO,
    })
    return { ok: true, id: result.data?.id }
  } catch (err) {
    console.error('[Email] Failed to send to', opts.to, err)
    return { ok: false, error: String(err) }
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function welcomeEmail(name: string): string {
  return layout(`
    <h1 style="margin:0 0 12px;font-size:24px;color:#ffffff;">Welcome to KDP Cover AI, ${name}! 🎉</h1>
    <p style="color:#d1d5db;margin:0 0 16px;">You're all set to create professional Amazon KDP book covers in minutes.</p>
    <p style="color:#d1d5db;margin:0 0 24px;">Here's what you can do right now:</p>
    <ul style="color:#d1d5db;padding-left:20px;margin:0 0 24px;">
      <li style="margin-bottom:8px;">✨ Generate a full-wrap cover with AI</li>
      <li style="margin-bottom:8px;">📐 Get exact KDP dimensions (spine, bleed, safe zones)</li>
      <li style="margin-bottom:8px;">✏️ Edit title, author name & back cover text live</li>
      <li style="margin-bottom:8px;">📄 Download a print-ready PDF for KDP upload</li>
    </ul>
    <a href="${SITE_URL}/generate" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:16px;">Create Your First Cover →</a>
    <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">Need help? Reply to this email — we read every message.</p>
  `)
}

export function newsletterEmail(opts: {
  name: string
  unsubToken: string
  features: Array<{ emoji: string; title: string; desc: string }>
  tip?: string
}): string {
  const featureRows = opts.features.map(f => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #374151;vertical-align:top;width:36px;font-size:22px;">${f.emoji}</td>
      <td style="padding:12px 0 12px 12px;border-bottom:1px solid #374151;">
        <strong style="color:#ffffff;display:block;margin-bottom:4px;">${f.title}</strong>
        <span style="color:#9ca3af;font-size:14px;">${f.desc}</span>
      </td>
    </tr>
  `).join('')

  const tipBlock = opts.tip ? `
    <div style="background:#1e1b4b;border:1px solid #4c1d95;border-radius:10px;padding:16px;margin:24px 0;">
      <p style="color:#c4b5fd;font-weight:bold;margin:0 0 8px;">💡 KDP Tip of the Update</p>
      <p style="color:#ddd6fe;margin:0;font-size:14px;">${opts.tip}</p>
    </div>
  ` : ''

  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#ffffff;">What's New on KDP Cover AI 🚀</h1>
    <p style="color:#9ca3af;margin:0 0 24px;font-size:14px;">Here's what we've been building for you</p>

    <table style="width:100%;border-collapse:collapse;">${featureRows}</table>

    ${tipBlock}

    <a href="${SITE_URL}/generate" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:16px;margin:24px 0;">Open KDP Cover AI →</a>

    <hr style="border:none;border-top:1px solid #374151;margin:24px 0;" />
    <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
      You're receiving this because you signed up at kdpcoverai.site.<br/>
      <a href="${SITE_URL}/api/newsletter/unsubscribe?token=${opts.unsubToken}" style="color:#6b7280;">Unsubscribe</a>
    </p>
  `)
}

export function confirmSubscriberEmail(token: string): string {
  return layout(`
    <h1 style="margin:0 0 12px;font-size:22px;color:#ffffff;">Confirm Your Email 📬</h1>
    <p style="color:#d1d5db;margin:0 0 20px;">Click the button below to confirm your email and get KDP cover tips, new feature updates, and exclusive tips — no spam, ever.</p>
    <a href="${SITE_URL}/api/newsletter/confirm?token=${token}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:16px;margin:0 0 20px;">✅ Confirm My Email</a>
    <p style="color:#6b7280;font-size:13px;margin:0;">If you didn't sign up, just ignore this email. Nothing will happen.</p>
  `)
}

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#0f0a1e;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:1px solid #1f2937;">
            <a href="${SITE_URL}" style="text-decoration:none;">
              <span style="color:#a78bfa;font-weight:900;font-size:18px;">KDP Cover AI</span>
            </a>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#111827;border-radius:0 0 12px 12px;padding:32px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="color:#374151;font-size:12px;margin:0;">© ${new Date().getFullYear()} KDP Cover AI · <a href="${SITE_URL}" style="color:#374151;">kdpcoverai.site</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
