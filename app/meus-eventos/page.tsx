'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ExternalLink, Trash2, RefreshCw, CalendarX, Tag } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/lib/auth'
import { meusEventos, cancelarParticipacao, type MeuEvento } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  ativo:     { label: 'Ativo',     classes: 'bg-emerald-100 text-emerald-700' },
  encerrado: { label: 'Encerrado', classes: 'bg-gray-100 text-gray-600' },
  cancelado: { label: 'Cancelado', classes: 'bg-red-100 text-red-600' },
  rascunho:  { label: 'Rascunho',  classes: 'bg-amber-100 text-amber-700' },
}

function formatDateRange(start: string, end: string): string {
  const s = parseISO(start)
  const e = parseISO(end)
  if (start === end) return format(s, "d 'de' MMM 'de' yyyy", { locale: ptBR })
  return `${format(s, "d 'de' MMM", { locale: ptBR })} – ${format(e, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`
}

export default function MeusEventosPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [eventos, setEventos]   = useState<MeuEvento[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [canceling, setCanceling] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingCancel = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/meus-eventos')
  }, [user, authLoading, router])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await meusEventos()
      setEventos(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar seus eventos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (user) fetchData() }, [user, fetchData])

  async function handleCancelar(eventoId: number, titulo: string) {
    pendingCancel.current = async () => {
      setCanceling(eventoId)
      try {
        await cancelarParticipacao(eventoId)
        setEventos(prev => prev.filter(e => e.evento_id !== eventoId))
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao cancelar presença')
      } finally {
        setCanceling(null)
      }
    }
    setConfirmOpen(true)
  }

  async function doConfirm() {
    if (!pendingCancel.current) return
    setConfirmLoading(true)
    await pendingCancel.current()
    setConfirmLoading(false)
    setConfirmOpen(false)
    pendingCancel.current = null
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ConfirmDialog
        open={confirmOpen}
        title="Cancelar presença"
        message="Tem certeza que deseja cancelar sua presença neste evento? Você poderá se inscrever novamente se houver vagas."
        confirmLabel="Cancelar presença"
        loading={confirmLoading}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <Navbar />

      <div className="bg-primary pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-white">Meus Eventos</h1>
          <p className="text-primary-foreground/70 mt-1">
            Eventos em que você confirmou presença
          </p>
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex justify-end mb-4">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Atualizar
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : eventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CalendarX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Nenhum evento confirmado</h2>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                Você ainda não confirmou presença em nenhum evento. Explore os eventos disponíveis e clique em "Confirmar Presença".
              </p>
              <Link
                href="/eventos"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Ver eventos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {eventos.map((item) => {
                const ev = item.eventos
                const badge = STATUS_BADGE[ev.status] ?? { label: ev.status, classes: 'bg-muted text-muted-foreground' }
                const expired = ev.status === 'encerrado' || ev.status === 'cancelado'

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity',
                      expired && 'opacity-70'
                    )}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', badge.classes)}>
                          {badge.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <Tag className="w-3 h-3" />
                          {ev.categoria}
                        </span>
                      </div>

                      <h3 className="font-bold text-foreground text-base leading-snug truncate">
                        {ev.titulo}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary/60" />
                          <span className="capitalize">{formatDateRange(ev.data_inicio, ev.data_fim)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary/60" />
                          {ev.hora_inicio.slice(0, 5)} – {ev.hora_fim.slice(0, 5)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Confirmado em {format(parseISO(item.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Link
                        href={`/eventos/${ev.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver evento
                      </Link>
                      <button
                        onClick={() => handleCancelar(ev.id, ev.titulo)}
                        disabled={canceling === ev.id}
                        className={cn(
                          'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          'border border-destructive/30 text-destructive hover:bg-destructive/10',
                          canceling === ev.id && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {canceling === ev.id ? 'Cancelando...' : 'Cancelar presença'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && eventos.length > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              {eventos.length} evento{eventos.length !== 1 ? 's' : ''} confirmado{eventos.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
