import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLang, errorKey } from '../i18n'
import { api } from '../api'
import { Shell, Field } from '../components/Shell'

export default function Reset() {
  const { t } = useLang()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api('/auth/reset', { body: { token, password }, auth: false })
      setDone(true)
    } catch (err) {
      setError(t(errorKey((err as Error).message)))
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('resetTitle')}</h1>

        {done ? (
          <>
            <p className="ui mt-6 rounded-lg bg-[var(--accent-soft)] p-4 text-[var(--ink)]">
              {t('resetDone')}
            </p>
            <p className="ui mt-6 text-center">
              <Link
                to="/login"
                className="rounded-full bg-[var(--accent)] px-6 py-2.5 font-semibold text-white no-underline shadow-sm"
              >
                {t('login')}
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="ui mt-2 text-[var(--muted)]">{t('resetIntro')}</p>
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
              <Field
                label={t('newPassword')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              {error && <p className="ui text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !token}
                className="ui mt-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {t('resetBtn')}
              </button>
            </form>
            <p className="ui mt-6 text-center text-sm">
              <Link to="/login" className="font-semibold text-[var(--accent)]">
                {t('backToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </Shell>
  )
}
