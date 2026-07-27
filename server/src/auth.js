import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me'
const TOKEN_TTL = '30d'

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10)
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash)
}

export function signToken(user) {
  return jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

// The workbook owners — always admins.
const BUILTIN_ADMINS = ['christossolonos@gmail.com', 'mariossolonos@gmail.com']

// The full admin set = the owners above, plus any extra emails listed in the
// ADMIN_EMAIL env var (comma-separated). All compared lower-cased.
function adminEmails() {
  const fromEnv = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return new Set([...BUILTIN_ADMINS, ...fromEnv])
}

// A user is an admin only if their email is in that allow-list.
export function isAdminEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  return !!e && adminEmails().has(e)
}

// Strip the password hash before sending a user to the client.
export function publicUser(u) {
  if (!u) return null
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    lang: u.lang,
    createdAt: u.created_at,
    isAdmin: isAdminEmail(u.email),
  }
}

// Express middleware: requires a valid Bearer token, attaches req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'not_authenticated' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.uid)
    if (!user) return res.status(401).json({ error: 'user_not_found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

// Express middleware: must run AFTER requireAuth. Blocks non-admins.
export function requireAdmin(req, res, next) {
  if (!req.user || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ error: 'forbidden' })
  }
  next()
}
