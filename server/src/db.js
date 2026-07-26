import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
mkdirSync(dataDir, { recursive: true })

export const db = new Database(join(dataDir, 'workbook.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ---- Schema ----
// Designed now so later steps (auth, answers, PDF) just use these tables.
db.exec(`
  CREATE TABLE IF NOT EXISTS access_codes (
    code        TEXT PRIMARY KEY,
    used_by     INTEGER,                 -- user id once redeemed (NULL = unused)
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    used_at     TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    lang          TEXT NOT NULL DEFAULT 'el',
    access_code   TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- One row per user per question. answer_json holds the value (shape depends on
  -- the question's answer type: text, choice, list, percentage, paired, etc.).
  CREATE TABLE IF NOT EXISTS answers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    answer_json TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

export default db
