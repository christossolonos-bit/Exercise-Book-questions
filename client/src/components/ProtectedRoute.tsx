import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useLang } from '../i18n'

// Guards pages that need a logged-in reader. While we're still checking the
// stored token, show a tiny loading state instead of flashing the login page.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { t } = useLang()

  if (loading) {
    return (
      <div className="ui flex min-h-full items-center justify-center text-[var(--muted)]">
        {t('loadingApp')}
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
