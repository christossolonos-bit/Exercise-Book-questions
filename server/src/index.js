import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { db } from './db.js'
import { authRouter } from './routes/auth.js'
import { answersRouter } from './routes/answers.js'
import { adminRouter } from './routes/admin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// ---- API ----
app.get('/api/health', (_req, res) => {
  // Touch the DB so "healthy" really means the whole stack is up.
  const row = db.prepare('SELECT 1 AS ok').get()
  res.json({ status: 'ok', db: row.ok === 1, time: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api', answersRouter)
app.use('/api', adminRouter)

// Unknown API routes return JSON 404 (never fall through to the SPA HTML below).
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))

// ---- Serve the built React app in production (single Railway service) ----
const clientDist = join(__dirname, '..', '..', 'client', 'dist')
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Who Are You? Workbook API listening on http://localhost:${PORT}`)
})
