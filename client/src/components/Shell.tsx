import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAuth } from '../auth'
import { LanguageToggle } from './LanguageToggle'

// Shared page frame: a top bar with the workbook title, nav (when signed in),
// and the language toggle, plus centred content.
export function Shell({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const { user, logout } = useAuth()

  const navLink = ({ isActive }: { isActive: boolean }) =>
    'rounded-full px-3 py-1.5 text-sm font-medium no-underline transition-colors ' +
    (isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
      : 'text-[var(--muted)] hover:bg-[var(--accent-soft)]')

  return (
    <div className="min-h-full flex flex-col">
      <header className="ui flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold text-[var(--ink)] no-underline">
            {t('appTitle')}
          </Link>
          {user && (
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/app" className={navLink}>
                {t('navWorkbook')}
              </NavLink>
              <NavLink to="/review" className={navLink}>
                {t('navReview')}
              </NavLink>
              {user.isAdmin && (
                <NavLink to="/admin" className={navLink}>
                  {t('navAdmin')}
                </NavLink>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={logout}
              className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              {t('logout')}
            </button>
          )}
          <LanguageToggle />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center px-6 py-10">{children}</main>
    </div>
  )
}

// A styled text input used across the auth forms.
export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="ui block text-left">
      <span className="mb-1 block text-sm font-medium text-[var(--muted)]">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
    </label>
  )
}
