import { Link, Navigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAuth } from '../auth'
import { Shell } from '../components/Shell'

export default function Landing() {
  const { t } = useLang()
  const { user } = useAuth()

  // Already signed in? Go straight to the workbook.
  if (user) return <Navigate to="/app" replace />

  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="ui mb-3 text-sm uppercase tracking-[0.25em] text-[var(--accent)]">
          {t('appSubtitle')}
        </p>
        <h1 className="text-5xl sm:text-6xl font-semibold leading-tight text-[var(--ink)]">
          {t('appTitle')}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--muted)]">{t('tagline')}</p>

        <Link
          to="/signup"
          className="ui mt-9 rounded-full bg-[var(--accent)] px-8 py-3 text-base font-semibold text-white no-underline shadow-sm transition-transform hover:-translate-y-0.5"
        >
          {t('begin')}
        </Link>

        <p className="ui mt-6 text-sm text-[var(--muted)]">
          {t('haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-[var(--accent)]">
            {t('login')}
          </Link>
        </p>
      </div>
    </Shell>
  )
}
