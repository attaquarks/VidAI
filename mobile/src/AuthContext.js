import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        if (await getToken()) {
          const { user: me } = await api('/auth/me')
          setUser(me)
        }
      } catch {
        await clearToken()
      } finally {
        setBooting(false)
      }
    })()
  }, [])

  const login = useCallback(async (email, password) => {
    const { user: u, accessToken } = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })
    await setToken(accessToken)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const { user: u, accessToken } = await api('/auth/register', { method: 'POST', body: payload, auth: false })
    await setToken(accessToken)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST' }) } catch { /* best effort */ }
    await clearToken()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, booting, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
