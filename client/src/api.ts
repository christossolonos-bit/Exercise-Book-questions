// Tiny fetch wrapper: adds JSON headers + the auth token, returns parsed data,
// and throws an Error whose .message is the server's error code (e.g. "code_used").
const TOKEN_KEY = 'wayw.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const code = (data as { error?: string })?.error || `http_${res.status}`
    throw new Error(code)
  }
  return data as T
}
