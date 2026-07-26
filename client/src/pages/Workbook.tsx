import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAnswers } from '../answers'
import { Shell } from '../components/Shell'
import { QuestionInput } from '../components/QuestionInputs'
import { flatten, loadQuestions, type QuestionSet, type LocalizedText } from '../questions'

export default function Workbook() {
  const { t, lang } = useLang()
  const answers = useAnswers()

  const [set, setSet] = useState<QuestionSet | null>(null)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const L = (x?: LocalizedText) => (x ? x[lang] : '')

  useEffect(() => {
    loadQuestions().then(setSet).catch(() => setSet(null))
  }, [])

  const items = useMemo(() => (set ? flatten(set) : []), [set])

  // Resume: jump to the first unanswered question the first time everything's loaded.
  const resumed = useRef(false)
  useEffect(() => {
    if (resumed.current || !set || !answers.ready || items.length === 0) return
    resumed.current = true
    const firstUnanswered = items.findIndex((it) => !answers.isAnswered(it.question.id))
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered)
  }, [set, answers, items])

  const total = items.length
  const answered = answers.answeredCount()

  const saveIndicator = (
    <span className="ui text-sm text-[var(--muted)]">
      {answers.status === 'saving' && t('saving')}
      {answers.status === 'saved' && `✓ ${t('saved')}`}
      {answers.status === 'error' && <span className="text-red-600">{t('saveError')}</span>}
    </span>
  )

  if (!set || !answers.ready) {
    return (
      <Shell>
        <div className="ui flex flex-1 items-center justify-center text-[var(--muted)]">
          {t('loadingQuestions')}
        </div>
      </Shell>
    )
  }

  if (done) {
    return (
      <Shell>
        <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
          <div className="text-5xl">🌱</div>
          <h1 className="mt-4 text-4xl font-semibold text-[var(--ink)]">{t('doneTitle')}</h1>
          <p className="mt-4 text-lg text-[var(--muted)]">{t('doneText')}</p>
          <div className="ui mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/review"
              className="rounded-full bg-[var(--accent)] px-7 py-3 font-semibold text-white no-underline shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {t('reviewAnswers')}
            </Link>
            <button
              onClick={() => {
                setDone(false)
                setIndex(0)
              }}
              className="rounded-full border border-[var(--line)] px-7 py-3 font-medium text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              {t('backToStart')}
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  const item = items[index]
  const q = item.question

  const goNext = () => {
    if (index >= total - 1) setDone(true)
    else setIndex((i) => i + 1)
  }
  const goBack = () => setIndex((i) => Math.max(0, i - 1))

  return (
    <Shell>
      <div className="flex w-full max-w-2xl flex-1 flex-col">
        {/* Progress */}
        <div className="ui mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
            <span>{L(item.chapter.title)}</span>
            <span>
              {index + 1} / {total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent-soft)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 text-right text-xs text-[var(--muted)]">
            {answered} / {total} {t('answeredProgress')}
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1">
          {q.section && (
            <p className="ui mb-2 text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              {L(q.section)}
            </p>
          )}
          <h1 className="text-2xl font-semibold leading-snug text-[var(--ink)] sm:text-3xl">
            {L(q.prompt)}
          </h1>
          {q.help && <p className="ui mt-3 text-[var(--muted)]">{L(q.help)}</p>}

          <div className="mt-7">
            <QuestionInput
              key={q.id}
              question={q}
              roles={set.roles}
              value={answers.get(q.id)}
              onChange={(v) => answers.save(q.id, v)}
            />
          </div>
        </div>

        {/* Footer nav */}
        <div className="ui mt-10 flex items-center justify-between border-t border-[var(--line)] pt-5">
          <button
            onClick={goBack}
            disabled={index === 0}
            className="rounded-full px-5 py-2.5 font-medium text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] disabled:opacity-40 disabled:hover:bg-transparent"
          >
            ← {t('back')}
          </button>
          {saveIndicator}
          <button
            onClick={goNext}
            className="rounded-full bg-[var(--accent)] px-7 py-2.5 font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {index >= total - 1 ? t('finish') : `${t('next')} →`}
          </button>
        </div>
      </div>
    </Shell>
  )
}
