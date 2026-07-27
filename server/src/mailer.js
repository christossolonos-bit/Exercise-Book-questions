import nodemailer from 'nodemailer'

// Email is optional: if SMTP isn't configured, sending is skipped gracefully
// (the caller can fall back to logging the link in development).
export function mailConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS)
}

let transporter = null
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transporter
}

const COPY = {
  el: {
    subject: 'Επαναφορά κωδικού — Ποιός / Ποιά Είσαι;',
    hi: (name) => `Γεια σου ${name},`,
    body: 'Ζήτησες να αλλάξεις τον κωδικό σου. Πάτησε το κουμπί πιο κάτω για να ορίσεις έναν νέο κωδικό. Ο σύνδεσμος ισχύει για 1 ώρα.',
    button: 'Όρισε νέο κωδικό',
    ignore: 'Αν δεν το ζήτησες εσύ, αγνόησε αυτό το email — ο κωδικός σου παραμένει ίδιος.',
  },
  en: {
    subject: 'Password reset — Who Are You?',
    hi: (name) => `Hi ${name},`,
    body: 'You asked to reset your password. Tap the button below to choose a new one. This link is valid for 1 hour.',
    button: 'Set a new password',
    ignore: "If you didn't request this, just ignore this email — your password stays the same.",
  },
}

export async function sendResetEmail({ to, name, url, lang }) {
  const c = COPY[lang === 'en' ? 'en' : 'el']
  const from = process.env.MAIL_FROM || `Who Are You? <${process.env.SMTP_USER}>`
  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#2c2a27">
      <h2 style="color:#a8743f">${c.subject}</h2>
      <p>${c.hi(name)}</p>
      <p>${c.body}</p>
      <p style="margin:28px 0">
        <a href="${url}" style="background:#a8743f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${c.button}</a>
      </p>
      <p style="font-size:13px;color:#6f6a63">${c.ignore}</p>
      <p style="font-size:12px;color:#6f6a63;word-break:break-all">${url}</p>
    </div>`
  await getTransporter().sendMail({ from, to, subject: c.subject, html })
}
