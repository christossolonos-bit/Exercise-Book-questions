import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { questions, questionIds } from '../questions.js'

export const answersRouter = Router()

// The whole question set (public — no answers, just the prompts).
answersRouter.get('/questions', (_req, res) => {
  res.json(questions)
})

// All of the signed-in reader's answers, as a { questionId: value } map.
answersRouter.get('/answers', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT question_id, answer_json, updated_at FROM answers WHERE user_id = ?')
    .all(req.user.id)
  const answers = {}
  for (const r of rows) {
    answers[r.question_id] = { value: JSON.parse(r.answer_json), updatedAt: r.updated_at }
  }
  res.json({ answers })
})

// Upsert one answer. Body: { value: <any> }. value shape depends on question type.
answersRouter.put('/answers/:questionId', requireAuth, (req, res) => {
  const { questionId } = req.params
  if (!questionIds.has(questionId)) {
    return res.status(404).json({ error: 'unknown_question' })
  }
  const value = req.body.value
  if (value === undefined) return res.status(400).json({ error: 'missing_value' })

  db.prepare(
    `INSERT INTO answers (user_id, question_id, answer_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, question_id)
     DO UPDATE SET answer_json = excluded.answer_json, updated_at = datetime('now')`,
  ).run(req.user.id, questionId, JSON.stringify(value))

  res.json({ ok: true })
})

// Delete ALL of the signed-in reader's answers (offered after a PDF export).
answersRouter.delete('/answers', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM answers WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true, deleted: info.changes })
})
