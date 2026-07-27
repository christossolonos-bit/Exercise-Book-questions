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

// A user is an admin if their email matches ADMIN_EMAIL (set in the environment).
export function isAdminEmail(email) {
  const admin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  return !!admin && String(email || '').trim().toLowerCase() === admin
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
