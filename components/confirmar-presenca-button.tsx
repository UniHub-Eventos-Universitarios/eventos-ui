'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, UserPlus, UserMinus, Loader2, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  statusParticipacao,
  confirmarParticipacao,
  cancelarParticipacao,
  ApiError,
} from '@/lib/api'
import { cn } from '@/lib/utils'

interface Props {
  eventoId: number
  eventoSlug: string
  expired: boolean
  semVagas: boolean
}

type Estado = 'init' | 'semAuth' | 'encerrado' | 'semVagas' | 'participando' | 'disponivel'

export default function ConfirmarPresencaButton({ eventoId, eventoSlug, expired, semVagas }: Props) {
  const { user, loading: authLoading } = useAuth()
  const [estado, setEstado] = useState<Estado>('init')
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setEstado('semAuth')
      return
    }
    if (expired) {
      setEstado('encerrado')
      return
    }
    if (semVagas) {
      setEstado('semVagas')
      return
    }

    statusParticipacao(eventoId)
      .then(({ participando }) => setEstado(participando ? 'participando' : 'disponivel'))
      .catch(() => setEstado('disponivel'))
  }, [authLoading, user, eventoId, expired, semVagas])

  async function handleConfirmar() {
    setSubmitting(true)
    setErro(null)
    try {
      await confirmarParticipacao(eventoId)
      setEstado('participando')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Erro ao confirmar presença. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelar() {
    setSubmitting(true)
    setErro(null)
    try {
      await cancelarParticipacao(eventoId)
      setEstado('disponivel')
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Erro ao cancelar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (estado === 'init') {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 bg-muted text-muted-foreground rounded-lg font-semibold">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (estado === 'semAuth') {
    return (
      <Link
        href={`/login?next=/eventos/${eventoSlug}`}
        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Entre para confirmar presença
      </Link>
    )
  }

  if (estado === 'encerrado') {
    return (
      <button
        disabled
        className="w-full py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed"
      >
        Evento encerrado
      </button>
    )
  }

  if (estado === 'semVagas') {
    return (
      <button
        disabled
        className="w-full py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed"
      >
        Vagas esgotadas
      </button>
    )
  }

  if (estado === 'participando') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-700 rounded-lg font-semibold border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4" />
          Presença Confirmada
        </div>
        <button
          onClick={handleCancelar}
          disabled={submitting}
          className={cn(
            'flex items-center justify-center gap-1.5 w-full py-2 text-sm text-muted-foreground hover:text-destructive transition-colors',
            submitting && 'opacity-50 cursor-not-allowed',
          )}
        >
          {submitting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <UserMinus className="w-3.5 h-3.5" />}
          Cancelar participação
        </button>
        {erro && <p className="text-xs text-destructive text-center">{erro}</p>}
      </div>
    )
  }

  // estado === 'disponivel'
  return (
    <div className="space-y-1.5">
      <button
        onClick={handleConfirmar}
        disabled={submitting}
        className={cn(
          'flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors',
          submitting && 'opacity-60 cursor-not-allowed',
        )}
      >
        {submitting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <UserPlus className="w-4 h-4" />}
        {submitting ? 'Confirmando...' : 'Confirmar Presença'}
      </button>
      {erro && <p className="text-xs text-destructive text-center">{erro}</p>}
    </div>
  )
}
