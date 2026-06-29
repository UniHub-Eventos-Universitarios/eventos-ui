'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { apiLogin, apiMe, apiRegister, type AuthResponse } from './api'

interface User {
  id: number
  nome: string
  email: string
  role: 'aluno' | 'professor' | 'admin'
}

interface AuthCtx {
  user: User | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  login(email: string, senha: string): Promise<void>
  register(nome: string, email: string, senha: string): Promise<void>
  logout(): void
}

const AuthContext = createContext<AuthCtx | null>(null)

const TOKEN_KEY = 'eventus_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null>(null)
  const [token, setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const applyAuth = useCallback((res: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setUser(res.user as User)
  }, [])

  // Restaura sessão ao montar
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) { setLoading(false); return }
    setToken(saved)
    apiMe()
      .then((u) => setUser(u as User))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(
    async (email: string, senha: string) => {
      const res = await apiLogin(email, senha)
      applyAuth(res)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (nome: string, email: string, senha: string) => {
      await apiRegister(nome, email, senha)
      const res = await apiLogin(email, senha)
      applyAuth(res)
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAdmin: user?.role === 'admin', login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
