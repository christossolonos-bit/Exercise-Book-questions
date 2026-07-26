# Who Are You? Workbook · Ποιός / Ποιά Είσαι;

The digital companion workbook for Marios Solonos' book *«Εγχειρίδιο Αφύπνισης και Επανασύνδεσης»*.
Readers create an account, work through its questions one at a time on their own profile,
save and edit their answers, and export an A4 PDF to send to the author for advice.

Bilingual: **Greek ⇄ English** toggle throughout.

## Stack

- **client/** — React 19 + Vite + Tailwind v4 (the reader-facing site)
- **server/** — Node + Express + SQLite (`better-sqlite3`) API
- Data is per-user and private. In production both are served by the one Express process.

## Develop

Two terminals:

```bash
# 1) API  (http://localhost:5000)
cd server
npm install
npm run dev

# 2) Web  (http://localhost:5173, proxies /api → 5000)
cd client
npm install
npm run dev
```

## Build order (one step at a time)

1. **Scaffold** — client + server + DB + GR/EN toggle ← _current_
2. Sign up → log in (open registration)
3. Questions, one at a time → save / edit answers per profile
4. "My answers" review page
5. A4 PDF export
6. New-signup webhook to the author
7. Navigation chatbot → (later) book-aware chatbot

## Content

The book's questions live in `content/questions-source-el.md` (Greek source) and get turned into a
structured, bilingual `questions.json` with per-question answer types (text, choice, list,
percentage, paired, …).
