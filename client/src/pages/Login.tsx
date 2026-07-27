import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang, errorKey } from '../i18n'
import { useAuth } from '../auth'
import { Shell, Field } from '../components/Shell'

export default function Login() {
  const { t } = useLang()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(t(errorKey((err as Error).message)))
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('loginTitle')}</h1>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <Field
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="ui text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="ui mt-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {t('loginBtn')}
          </button>
        </form>

        <p className="ui mt-4 text-center text-sm">
          <Link to="/forgot" className="text-[var(--muted)] hover:text-[var(--accent)]">
            {t('forgotLink')}
          </Link>
        </p>

        <p className="ui mt-6 text-center text-sm text-[var(--muted)]">
          {t('noAccount')}{' '}
          <Link to="/signup" className="font-semibold text-[var(--accent)]">
            {t('begin')}
          </Link>
        </p>
      </div>
    </Shell>
  )
}
