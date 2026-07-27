import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

export const adminRouter = Router()

// All admin routes require a logged-in admin.
adminRouter.use(requireAuth, requireAdmin)

// List every user with their progress (answer COUNT only — never the answers
// themselves, which stay private to each reader).
adminRouter.get('/admin/users', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.lang, u.created_at,
              (SELECT COUNT(*) FROM answers a WHERE a.user_id = u.id) AS answer_count
       FROM users u
       ORDER BY u.created_at DESC`,
    )
    .all()
  res.json({ users: rows })
})
