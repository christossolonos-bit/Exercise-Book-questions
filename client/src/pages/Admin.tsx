import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAuth } from '../auth'
import { api } from '../api'
import { Shell } from '../components/Shell'
import { AnswerDisplay } from '../components/AnswerDisplay'
import { loadQuestions, type QuestionSet, type LocalizedText } from '../questions'

type AdminUser = {
  id: number
  name: string
  email: string
  lang: string
  created_at: string
  answer_count: number
}

type UserAnswers = {
  user: { id: number; name: string; email: string; created_at: string }
  answers: Record<string, { value: unknown }>
}

export default function Admin() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [set, setSet] = useState<QuestionSet | null>(null)
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [selected, setSelected] = useState<UserAnswers | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const L = (x?: LocalizedText) => (x ? x[lang] : '')

  useEffect(() => {
    loadQuestions().then(setSet).catch(() => setSet(null))
    api<{ users: AdminUser[] }>('/admin/users')
      .then((d) => setUsers(d.users))
      .catch(() => setUsers([]))
  }, [])

  // Guard: only admins (non-admins who reach the URL get bounced).
  if (user && !user.isAdmin) return <Navigate to="/app" replace />

  function openUser(id: number) {
    setLoadingDetail(true)
    setSelected(null)
    api<UserAnswers>(`/admin/users/${id}/answers`)
      .then(setSelected)
      .finally(() => setLoadingDetail(false))
  }

  if (!set || !users) {
    return (
      <Shell>
        <div className="ui flex flex-1 items-center justify-center text-[var(--muted)]">
          {t('loadingQuestions')}
        </div>
      </Shell>
    )
  }

  // ---- Detail view: one user's answers ----
  if (selected || loadingDetail) {
    return (
      <Shell>
        <div className="w-full max-w-3xl">
          <button
            onClick={() => setSelected(null)}
            className="ui mb-6 text-sm font-medium text-[var(--accent)]"
          >
            {t('adminBackToUsers')}
          </button>

          {loadingDetail || !selected ? (
            <p className="ui text-[var(--muted)]">{t('loadingQuestions')}</p>
          ) : (
            <>
              <h1 className="text-3xl font-semibold text-[var(--ink)]">{selected.user.name}</h1>
              <p className="ui mt-1 text-[var(--muted)]">{selected.user.email}</p>

              {Object.keys(selected.answers).length === 0 ? (
                <p className="ui mt-8 text-[var(--muted)]">{t('adminNoAnswers')}</p>
              ) : (
                <div className="mt-8 flex flex-col gap-10">
                  {set.chapters.map((chapter) => {
                    const answered = chapter.questions.filter((q) => q.id in selected.answers)
                    if (answered.length === 0) return null
                    return (
                      <section key={chapter.id}>
                        <p className="ui text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                          {L(chapter.part)}
                        </p>
                        <h2 className="mb-5 border-b border-[var(--line)] pb-2 text-xl font-semibold text-[var(--ink)]">
                          {L(chapter.title)}
                        </h2>
                        <div className="flex flex-col gap-6">
                          {answered.map((q) => (
                            <div key={q.id}>
                              <p className="mb-1.5 font-semibold text-[var(--ink)]">{L(q.prompt)}</p>
                              <AnswerDisplay
                                question={q}
                                value={selected.answers[q.id].value}
                                roles={set.roles}
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Shell>
    )
  }

  // ---- List view: all users ----
  return (
    <Shell>
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('adminTitle')}</h1>
        <p className="ui mt-1 text-[var(--muted)]">{t('adminIntro')}</p>

        {users.length === 0 ? (
          <p className="ui mt-8 text-[var(--muted)]">{t('adminNoUsers')}</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => openUser(u.id)}
                  className="ui flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left transition-colors hover:border-[var(--accent)]"
                >
                  <span>
                    <span className="block font-semibold text-[var(--ink)]">{u.name}</span>
                    <span className="block text-sm text-[var(--muted)]">{u.email}</span>
                  </span>
                  <span className="flex items-center gap-4 text-sm text-[var(--muted)]">
                    <span>
                      {u.answer_count} {t('adminAnswered')}
                    </span>
                    <span className="text-[var(--accent)]">{t('adminView')} →</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  )
}
