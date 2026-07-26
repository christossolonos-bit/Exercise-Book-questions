// Generate a batch of access codes to print in the book.
// Usage: node src/seed-codes.js [count]
//   e.g. node src/seed-codes.js 50
import { randomBytes } from 'node:crypto'
import { db } from './db.js'

const count = Math.max(1, parseInt(process.argv[2] || '20', 10))

// Human-friendly code: WAYW-XXXX-XXXX using an unambiguous alphabet
// (no 0/O, 1/I/L) so people can type it off a printed page without confusion.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function block(n) {
  const bytes = randomBytes(n)
  let out = ''
  for (let i = 0; i < n; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}
function makeCode() {
  return `WAYW-${block(4)}-${block(4)}`
}

const insert = db.prepare('INSERT OR IGNORE INTO access_codes (code) VALUES (?)')
const created = []
const insertMany = db.transaction(() => {
  while (created.length < count) {
    const code = makeCode()
    const info = insert.run(code)
    if (info.changes === 1) created.push(code)
  }
})
insertMany()

console.log(`Created ${created.length} access codes:\n`)
created.forEach((c) => console.log('  ' + c))
const total = db.prepare('SELECT COUNT(*) AS n FROM access_codes').get().n
console.log(`\nTotal codes in database: ${total}`)
