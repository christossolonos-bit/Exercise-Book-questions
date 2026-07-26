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

// Normalize codes so "wayw-ab12" and "WAYW-AB12 " match the stored form.
const normCode = (c) => String(c || '').trim().toUpperCase()
const normEmail = (e) => String(e || '').trim().toLowerCase()

// --- Check an access code without consuming it (used live on the signup form) ---
authRouter.post('/check-code', (req, res) => {
  const code = normCode(req.body.code)
  if (!code) return res.status(400).json({ valid: false, reason: 'empty' })
  const row = db.prepare('SELECT code, used_by FROM access_codes WHERE code = ?').get(code)
  if (!row) return res.json({ valid: false, reason: 'not_found' })
  if (row.used_by) return res.json({ valid: false, reason: 'used' })
  return res.json({ valid: true })
})

// --- Sign up: consumes a valid code + creates the account, all in one transaction ---
authRouter.post('/signup', (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = normEmail(req.body.email)
  const password = String(req.body.password || '')
  const code = normCode(req.body.code)
  const lang = req.body.lang === 'en' ? 'en' : 'el'

  if (!name || !email || !password || !code) {
    return res.status(400).json({ error: 'missing_fields' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'weak_password' })
  }

  const codeRow = db.prepare('SELECT code, used_by FROM access_codes WHERE code = ?').get(code)
  if (!codeRow) return res.status(400).json({ error: 'code_invalid' })
  if (codeRow.used_by) return res.status(400).json({ error: 'code_used' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'email_taken' })

  try {
    const createUser = db.transaction(() => {
      const info = db
        .prepare(
          `INSERT INTO users (name, email, password_hash, lang, access_code)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(name, email, hashPassword(password), lang, code)
      const userId = info.lastInsertRowid
      // Mark the code used — the UNIQUE-ish guard against double redemption.
      const upd = db
        .prepare(
          `UPDATE access_codes SET used_by = ?, used_at = datetime('now')
           WHERE code = ? AND used_by IS NULL`,
        )
        .run(userId, code)
      if (upd.changes !== 1) throw new Error('code_race') // someone grabbed it first
      return userId
    })
    const userId = createUser()
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    return res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (e) {
    if (String(e.message).includes('code_race')) {
      return res.status(400).json({ error: 'code_used' })
    }
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
