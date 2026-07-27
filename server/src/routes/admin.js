import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

export const adminRouter = Router()

// All admin routes require a logged-in admin.
adminRouter.use(requireAuth, requireAdmin)

// List every user with their answer count + join date.
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

// One user's answers as a { questionId: value } map, plus their basic info.
adminRouter.get('/admin/users/:id/answers', (req, res) => {
  const id = Number(req.params.id)
  const user = db.prepare('SELECT id, name, email, lang, created_at FROM users WHERE id = ?').get(id)
  if (!user) return res.status(404).json({ error: 'user_not_found' })

  const rows = db
    .prepare('SELECT question_id, answer_json, updated_at FROM answers WHERE user_id = ?')
    .all(id)
  const answers = {}
  for (const r of rows) {
    answers[r.question_id] = { value: JSON.parse(r.answer_json), updatedAt: r.updated_at }
  }
  res.json({ user, answers })
})
