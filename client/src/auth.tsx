import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore } from './api'

export type User = {
  id: number
  name: string
  email: string
  lang: 'el' | 'en'
  createdAt: string
}

type AuthResult = { token: string; user: User }

type AuthCtx = {
  user: User | null
  loading: boolean
  signup: (input: {
    name: string
    email: string
    password: string
    lang: 'el' | 'en'
  }) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On load, if we have a token, ask the server who we are.
  useEffect(() => {
    const token = tokenStore.get()
    if (!token) {
      setLoading(false)
      return
    }
    api<{ user: User }>('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = (r: AuthResult) => {
    tokenStore.set(r.token)
    setUser(r.user)
  }

  const signup: AuthCtx['signup'] = async (input) => {
    handleAuth(await api<AuthResult>('/auth/signup', { body: input }))
  }
  const login: AuthCtx['login'] = async (email, password) => {
    handleAuth(await api<AuthResult>('/auth/login', { body: { email, password } }))
  }
  const logout = () => {
    tokenStore.clear()
    setUser(null)
  }

  return (
    <Ctx.Provider value={{ user, loading, signup, login, logout }}>{children}</Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
