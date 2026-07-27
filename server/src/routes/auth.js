import { Router } from 'express'
import { randomBytes, createHash } from 'node:crypto'
import { db } from '../db.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  publicUser,
  requireAuth,
} from '../auth.js'
import { mailConfigured, sendResetEmail } from '../mailer.js'

export const authRouter = Router()

const normEmail = (e) => String(e || '').trim().toLowerCase()
const sha256 = (s) => createHash('sha256').update(s).digest('hex')
const APP_URL = () => (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')

// --- Sign up: open registration (name + email + password) ---
authRouter.post('/signup', (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = normEmail(req.body.email)
  const password = String(req.body.password || '')
  const lang = req.body.lang === 'en' ? 'en' : 'el'

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'weak_password' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'email_taken' })

  try {
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, lang) VALUES (?, ?, ?, ?)')
      .run(name, email, hashPassword(password), lang)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
    return res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (e) {
    console.error('signup failed:', e)
    return res.status(500).json({ error: 'server_error' })
  }
})

// --- Log in ---
authRouter.post('/login', (req, res) => {
  const email = normEmail(req.body.email)
  const password = String(req.body.password || '')
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'bad_credentials' })
  }
  return res.json({ token: signToken(user), user: publicUser(user) })
})

// --- Forgot password: email a reset link (always 200, never reveals if the
//     email exists, to avoid leaking who has an account) ---
authRouter.post('/forgot', async (req, res) => {
  const email = normEmail(req.body.email)
  const lang = req.body.lang === 'en' ? 'en' : 'el'
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

  const response = { ok: true }
  if (user) {
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    // One active reset per user: clear old ones first.
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id)
    db.prepare(
      'INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    ).run(sha256(token), user.id, expires)

    const url = `${APP_URL()}/reset?token=${token}`
    try {
      if (mailConfigured()) {
        await sendResetEmail({ to: user.email, name: user.name, url, lang })
      } else {
        console.warn('[mailer] SMTP not configured — reset link:', url)
        // Dev convenience only: expose the link so the flow is testable locally.
        if (process.env.NODE_ENV !== 'production') response.devResetUrl = url
      }
    } catch (e) {
      console.error('[mailer] failed to send reset email:', e.message)
    }
  }
  res.json(response)
})

// --- Reset password using the token from the email ---
authRouter.post('/reset', (req, res) => {
  const token = String(req.body.token || '')
  const password = String(req.body.password || '')
  if (!token || password.length < 6) {
    return res.status(400).json({ error: 'weak_password' })
  }
  const row = db.prepare('SELECT * FROM password_resets WHERE token_hash = ?').get(sha256(token))
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'invalid_or_expired' })
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), row.user_id)
  db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(row.user_id)
  res.json({ ok: true })
})

// --- Who am I (validates a stored token on app load) ---
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

// --- Update my preferred language (keeps server in sync with the toggle) ---
authRouter.patch('/me/lang', requireAuth, (req, res) => {
  const lang = req.body.lang === 'en' ? 'en' : 'el'
  db.prepare('UPDATE users SET lang = ? WHERE id = ?').run(lang, req.user.id)
  res.json({ ok: true, lang })
})
