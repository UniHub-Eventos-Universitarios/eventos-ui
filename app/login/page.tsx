'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const nextUrl      = searchParams.get('next') ?? '/eventos'
  const { user, login, loading: authLoading } = useAuth()

  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.replace(nextUrl)
  }, [user, authLoading, router, nextUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, senha)
      router.replace(nextUrl)
    } catch {
      setError('E-mail ou senha incorretos. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo ───────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col p-10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e7c7b 0%, #0f5662 45%, #0a1628 100%)' }}
      >
        {/* Decoração de fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo topo */}
        <div className="relative z-10">
          <Logo height={36} forceLight />
        </div>

        {/* Logo grande centralizada */}
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

        {/* Citação */}
        <blockquote className="relative z-10">
          <p className="text-white/80 text-sm italic leading-relaxed">
            &ldquo;A educação é a arma mais poderosa que você pode usar para mudar o mundo.&rdquo;
          </p>
          <footer className="mt-2 text-white/50 text-xs">~ Nelson Mandela</footer>
        </blockquote>
      </div>

      {/* ── Painel direito ────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-black">

        {/* Botão voltar */}
        <div className="px-6 pt-6">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* Logo mobile (só aparece em telas menores que lg) */}
        <div className="flex lg:hidden justify-center pt-8">
          <Logo height={64} alwaysFull />
        </div>

        {/* Formulário */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <p className="text-center text-white/40 text-sm mb-6">
              Preencha os dados abaixo para fazer login.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <h1 className="text-2xl font-bold text-white text-center mb-7">Entrar</h1>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-white/70">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="senha" className="block text-sm font-medium text-white/70">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      type={showPwd ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Sua senha"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={cn('flex items-start gap-2 p-3 rounded-lg text-sm', 'bg-red-500/10 border border-red-500/20 text-red-400')}>
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !senha}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ background: 'linear-gradient(to right, #3B82F6, #06B6D4)' }}
                >
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>
              </form>

              <p className="text-center text-sm text-white/40 mt-6">
                Não tem uma conta?{' '}
                <Link
                  href={`/registro${nextUrl !== '/eventos' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
