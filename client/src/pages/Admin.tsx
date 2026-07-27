import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLang } from '../i18n'
import { useAuth } from '../auth'
import { api } from '../api'
import { Shell } from '../components/Shell'

type AdminUser = {
  id: number
  name: string
  email: string
  lang: string
  created_at: string
  answer_count: number
}

export default function Admin() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[] | null>(null)

  useEffect(() => {
    api<{ users: AdminUser[] }>('/admin/users')
      .then((d) => setUsers(d.users))
      .catch(() => setUsers([]))
  }, [])

  // Guard: only admins (non-admins who reach the URL get bounced).
  if (user && !user.isAdmin) return <Navigate to="/app" replace />

  const fmtDate = (iso: string) =>
    new Date(iso.replace(' ', 'T') + 'Z').toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB')

  if (!users) {
    return (
      <Shell>
        <div className="ui flex flex-1 items-center justify-center text-[var(--muted)]">…</div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-[var(--ink)]">{t('adminTitle')}</h1>
        <p className="ui mt-1 text-[var(--muted)]">{t('adminIntro')}</p>
        <p className="ui mt-1 text-sm text-[var(--muted)]">{t('adminPrivacyNote')}</p>

        {users.length === 0 ? (
          <p className="ui mt-8 text-[var(--muted)]">{t('adminNoUsers')}</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="ui flex items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3"
              >
                <span>
                  <span className="block font-semibold text-[var(--ink)]">{u.name}</span>
                  <span className="block text-sm text-[var(--muted)]">{u.email}</span>
                </span>
                <span className="flex flex-col items-end text-sm text-[var(--muted)]">
                  <span>
                    {u.answer_count} {t('adminAnswered')}
                  </span>
                  <span className="text-xs">
                    {t('adminJoined')} {fmtDate(u.created_at)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  )
}
