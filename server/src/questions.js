import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, '..', '..', 'content', 'questions.json')

// Load once at startup. Resolve `optionsRef` (e.g. "yesno") into inline options
// and flatten a lookup so answer-saving can validate a question id exists.
function load() {
  const raw = JSON.parse(readFileSync(file, 'utf8'))
  const shared = { yesno: raw.yesno }

  for (const chapter of raw.chapters) {
    for (const q of chapter.questions) {
      if (q.optionsRef && shared[q.optionsRef]) {
        q.options = shared[q.optionsRef]
        delete q.optionsRef
      }
    }
  }
  const ids = new Set()
  for (const c of raw.chapters) for (const q of c.questions) ids.add(q.id)
  return { data: raw, ids }
}

const { data, ids } = load()

export const questions = data
export const questionIds = ids
export const totalQuestions = [...ids].length
