'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroContent />
    </Suspense>
  )
}

function RegistroContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const nextUrl      = searchParams.get('next') ?? '/eventos'
  const { user, register, loading: authLoading } = useAuth()

  const [nome,    setNome]    = useState('')
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.replace(nextUrl)
  }, [user, authLoading, router, nextUrl])

  const senhaOk    = senha.length >= 6
  const confirmOk  = senha === confirm && confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!senhaOk)   { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (!confirmOk) { setError('As senhas não coincidem.'); return }

    setLoading(true)
    try {
      await register(nome, email, senha)
      router.replace(nextUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('email') || msg.includes('e-mail')) {
        setError('Este e-mail já está cadastrado. Faça login ou use outro e-mail.')
      } else {
        setError('Não foi possível criar a conta. Verifique os dados e tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-3">
            <Logo height={48} alwaysFull />
          </Link>
          <p className="text-muted-foreground text-sm">Crie sua conta para participar dos eventos</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <div className="space-y-1">
              <label htmlFor="nome" className="block text-sm font-medium text-foreground">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria Silva" required autoComplete="name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" required autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="senha" className="block text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="senha" type={showPwd ? 'text' : 'password'} value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required autoComplete="new-password"
                  className={cn(
                    'w-full pl-9 pr-10 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors',
                    senha && (senhaOk ? 'border-emerald-400' : 'border-amber-400 focus:border-amber-400')
                  )}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirm" type={showPwd ? 'text' : 'password'} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a senha" required autoComplete="new-password"
                  className={cn(
                    'w-full pl-9 pr-10 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors',
                    confirm && (confirmOk ? 'border-emerald-400' : 'border-red-400 focus:border-red-400')
                  )}
                />
                {confirm && confirmOk && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nome || !email || !senha || !confirm}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tem uma conta?{' '}
            <Link
              href={`/login${nextUrl !== '/eventos' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/eventos" className="hover:text-foreground transition-colors">
            ← Voltar para os eventos
          </Link>
        </p>
      </div>
    </div>
  )
}
