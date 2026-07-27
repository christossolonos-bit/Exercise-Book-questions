import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api } from './api'
import { useAuth } from './auth'

// Answer values are shape-flexible (string, string[], number, objects) per question type.
export type AnswerValue = unknown
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type AnswersCtx = {
  ready: boolean
  status: SaveStatus
  get: (questionId: string) => AnswerValue
  isAnswered: (questionId: string) => boolean
  answeredCount: () => number
  save: (questionId: string, value: AnswerValue) => void
  clearAll: () => Promise<void>
}

const Ctx = createContext<AnswersCtx | null>(null)

// A value counts as "answered" if it holds real content (not empty string/array/object).
function hasContent(v: AnswerValue): boolean {
  if (v == null) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'number') return true
  if (Array.isArray(v)) return v.some(hasContent)
  if (typeof v === 'object') return Object.values(v as object).some(hasContent)
  return false
}

export function AnswersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [map, setMap] = useState<Record<string, AnswerValue>>({})
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')

  // Per-question debounce timers, and a queue so rapid typing collapses to one save.
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const inFlight = useRef(0)

  useEffect(() => {
    if (!user) return
    setReady(false)
    api<{ answers: Record<string, { value: AnswerValue }> }>('/answers')
      .then((d) => {
        const next: Record<string, AnswerValue> = {}
        for (const [qid, entry] of Object.entries(d.answers)) next[qid] = entry.value
        setMap(next)
      })
      .catch(() => setMap({}))
      .finally(() => setReady(true))
  }, [user])

  const flush = (questionId: string, value: AnswerValue) => {
    inFlight.current += 1
    setStatus('saving')
    api(`/answers/${questionId}`, { method: 'PUT', body: { value } })
      .then(() => {
        inFlight.current -= 1
        if (inFlight.current === 0) setStatus('saved')
      })
      .catch(() => {
        inFlight.current -= 1
        setStatus('error')
      })
  }

  const save: AnswersCtx['save'] = (questionId, value) => {
    setMap((m) => ({ ...m, [questionId]: value }))
    setStatus('saving')
    if (timers.current[questionId]) clearTimeout(timers.current[questionId])
    timers.current[questionId] = setTimeout(() => flush(questionId, value), 600)
  }

  const clearAll = async () => {
    await api('/answers', { method: 'DELETE' })
    setMap({})
    setStatus('idle')
  }

  const value: AnswersCtx = {
    ready,
    status,
    get: (qid) => map[qid],
    isAnswered: (qid) => hasContent(map[qid]),
    answeredCount: () => Object.keys(map).filter((k) => hasContent(map[k])).length,
    save,
    clearAll,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnswers() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAnswers must be used inside <AnswersProvider>')
  return ctx
}
