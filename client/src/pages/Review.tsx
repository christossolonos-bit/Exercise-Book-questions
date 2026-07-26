import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAuth } from '../auth'
import { useAnswers } from '../answers'
import { Shell } from '../components/Shell'
import { AnswerDisplay } from '../components/AnswerDisplay'
import { loadQuestions, type QuestionSet, type LocalizedText } from '../questions'

export default function Review() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const answers = useAnswers()
  const [set, setSet] = useState<QuestionSet | null>(null)
  const [exporting, setExporting] = useState(false)
  const L = (x?: LocalizedText) => (x ? x[lang] : '')

  useEffect(() => {
    loadQuestions().then(setSet).catch(() => setSet(null))
  }, [])

  async function handleExport() {
    if (!set || !user) return
    setExporting(true)
    try {
      // Lazy-load the PDF engine + fonts only when actually exporting.
      const { exportWorkbookPdf } = await import('../pdf/export')
      const answerMap: Record<string, unknown> = {}
      for (const c of set.chapters)
        for (const q of c.questions) {
          const v = answers.get(q.id)
          if (v !== undefined) answerMap[q.id] = v
        }
      await exportWorkbookPdf({
        set,
        answers: answerMap,
        lang,
        reader: user.name,
        dateStr: new Date().toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB'),
        labels: {
          title: t('appTitle'),
          subtitle: t('reviewTitle'),
          forLabel: t('pdfFor'),
          generatedOn: t('generatedOn'),
          feelLabel: t('feelLabel'),
          describeLabel: t('describeLabel'),
          personN: t('personN'),
        },
      })
    } finally {
      setExporting(false)
    }
  }

  if (!set || !answers.ready) {
    return (
      <Shell>
        <div className="ui flex flex-1 items-center justify-center text-[var(--muted)]">
          {t('loadingQuestions')}
        </div>
      </Shell>
    )
  }

  const total = set.chapters.reduce((n, c) => n + c.questions.length, 0)
  const answered = answers.answeredCount()

  if (answered === 0) {
    return (
      <Shell>
        <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('reviewTitle')}</h1>
          <p className="ui mt-4 text-[var(--muted)]">{t('reviewEmpty')}</p>
          <Link
            to="/app"
            className="ui mt-8 rounded-full bg-[var(--accent)] px-7 py-3 font-semibold text-white no-underline shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {t('goAnswer')}
          </Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="ui mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('reviewTitle')}</h1>
            <p className="mt-1 text-[var(--muted)]">{t('reviewIntro')}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {answered} / {total} {t('answeredProgress')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/app"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--muted)] no-underline transition-colors hover:bg-[var(--accent-soft)]"
            >
              {t('continueEditing')}
            </Link>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {exporting ? t('preparingPdf') : t('exportPdf')}
            </button>
          </div>
        </div>

        {/* Chapters */}
        <div className="flex flex-col gap-10">
          {set.chapters.map((chapter) => {
            const answeredInChapter = chapter.questions.filter((q) => answers.isAnswered(q.id))
            if (answeredInChapter.length === 0) return null
            return (
              <section key={chapter.id}>
                <p className="ui text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                  {L(chapter.part)}
                </p>
                <h2 className="mb-5 border-b border-[var(--line)] pb-2 text-xl font-semibold text-[var(--ink)]">
                  {L(chapter.title)}
                </h2>
                <div className="flex flex-col gap-6">
                  {chapter.questions.map((q) => {
                    if (!answers.isAnswered(q.id)) return null
                    return (
                      <div key={q.id}>
                        <p className="mb-1.5 font-semibold text-[var(--ink)]">{L(q.prompt)}</p>
                        <AnswerDisplay question={q} value={answers.get(q.id)} roles={set.roles} />
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}
