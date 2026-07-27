import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { api } from '../api'
import { Shell, Field } from '../components/Shell'

export default function Forgot() {
  const { t, lang } = useLang()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Always succeeds from the user's view (we don't reveal if the email exists).
      const res = await api<{ ok: boolean; devResetUrl?: string }>('/auth/forgot', {
        body: { email, lang },
        auth: false,
      })
      if (res.devResetUrl) console.info('[dev] reset link:', res.devResetUrl)
    } catch {
      /* ignore — still show the generic confirmation */
    }
    setSent(true)
    setSubmitting(false)
  }

  return (
    <Shell>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('forgotTitle')}</h1>

        {sent ? (
          <p className="ui mt-6 rounded-lg bg-[var(--accent-soft)] p-4 text-[var(--ink)]">
            {t('forgotSent')}
          </p>
        ) : (
          <>
            <p className="ui mt-2 text-[var(--muted)]">{t('forgotIntro')}</p>
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
              <Field
                label={t('email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="ui mt-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {t('forgotBtn')}
              </button>
            </form>
          </>
        )}

        <p className="ui mt-6 text-center text-sm">
          <Link to="/login" className="font-semibold text-[var(--accent)]">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </Shell>
  )
}
