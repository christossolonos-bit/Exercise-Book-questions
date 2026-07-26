import { Router } from 'express'
import { db } from '../db.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  publicUser,
  requireAuth,
} from '../auth.js'

export const authRouter = Router()

const normEmail = (e) => String(e || '').trim().toLowerCase()

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
