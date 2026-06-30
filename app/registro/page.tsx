'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Eye, EyeOff, CheckCircle, ChevronLeft } from 'lucide-react'
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

  const senhaOk   = senha.length >= 6
  const confirmOk = senha === confirm && confirm.length > 0

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

  const inputBase = 'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors'

  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo ───────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col p-10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7c7b 0%, #0f5662 45%, #0a1628 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <div className="relative z-10">
          <Logo height={36} forceLight />
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <Image
            src="/eventus-logos/logo-eventus-light-mode.svg"
            alt="Eventus"
            width={180}
            height={180}
            className="opacity-90 drop-shadow-2xl"
            priority
            unoptimized
          />
        </div>

        <blockquote className="relative z-10">
          <p className="text-white/80 text-sm italic leading-relaxed">
            &ldquo;Investir em conhecimento sempre paga o melhor juro.&rdquo;
          </p>
          <footer className="mt-2 text-white/50 text-xs">~ Benjamin Franklin</footer>
        </blockquote>
      </div>

      {/* ── Painel direito ────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-black">

        <div className="px-6 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Já tenho conta
          </Link>
        </div>

        <div className="flex lg:hidden justify-center pt-8">
          <Logo height={64} alwaysFull />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <p className="text-center text-white/40 text-sm mb-6">
              Crie sua conta para participar dos eventos acadêmicos.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <h1 className="text-2xl font-bold text-white text-center mb-7">Criar conta</h1>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="nome" className="block text-sm font-medium text-white/70">Nome completo</label>
                  <input
                    id="nome" type="text" value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria Silva" required autoComplete="name"
                    className={cn(inputBase, 'border-white/10 focus:border-cyan-500/40')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-white/70">E-mail</label>
                  <input
                    id="email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" required autoComplete="email"
                    className={cn(inputBase, 'border-white/10 focus:border-cyan-500/40')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="senha" className="block text-sm font-medium text-white/70">Senha</label>
                  <div className="relative">
                    <input
                      id="senha" type={showPwd ? 'text' : 'password'} value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres" required autoComplete="new-password"
                      className={cn(inputBase, 'pr-11',
                        senha
                          ? senhaOk ? 'border-emerald-500/50 focus:ring-emerald-500/30' : 'border-amber-500/50 focus:ring-amber-500/30'
                          : 'border-white/10 focus:border-cyan-500/40'
                      )}
                    />
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm" className="block text-sm font-medium text-white/70">Confirmar senha</label>
                  <div className="relative">
                    <input
                      id="confirm" type={showPwd ? 'text' : 'password'} value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repita a senha" required autoComplete="new-password"
                      className={cn(inputBase, 'pr-11',
                        confirm
                          ? confirmOk ? 'border-emerald-500/50 focus:ring-emerald-500/30' : 'border-red-500/50 focus:ring-red-500/30'
                          : 'border-white/10 focus:border-cyan-500/40'
                      )}
                    />
                    {confirm && confirmOk && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !nome || !email || !senha || !confirm}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ background: 'linear-gradient(to right, #3B82F6, #06B6D4)' }}
                >
                  {loading ? 'Criando conta…' : 'Criar conta'}
                </button>
              </form>

              <p className="text-center text-sm text-white/40 mt-6">
                Já tem uma conta?{' '}
                <Link
                  href={`/login${nextUrl !== '/eventos' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
