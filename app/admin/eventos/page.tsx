'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Pencil, Trash2, Calendar, Users, AlertCircle,
  Search, ArrowLeft, RefreshCw, Eye,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getEventos, deleteEvento } from '@/lib/api'
import type { Event } from '@/lib/data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  ativo:     'Ativo',
  rascunho:  'Rascunho',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
}

const STATUS_CLASS: Record<string, string> = {
  ativo:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  rascunho:  'bg-amber-100 text-amber-700 border-amber-200',
  encerrado: 'bg-muted text-muted-foreground border-border',
  cancelado: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminEventosPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [events,  setEvents]  = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error,   setError]   = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingDelete = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/login?next=/admin/eventos')
    }
  }, [user, isAdmin, authLoading, router])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getEventos({ perPage: '100' })
      setEvents(data)
    } catch {
      setError('Não foi possível carregar os eventos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && isAdmin) fetchEvents()
  }, [authLoading, isAdmin, fetchEvents])

  const handleDelete = (id: number, title: string) => {
    pendingDelete.current = async () => {
      setDeleting(id)
      try {
        await deleteEvento(id)
        setEvents((prev) => prev.filter((e) => Number(e.id) !== id))
      } catch {
        toast.error('Não foi possível excluir o evento.')
      } finally {
        setDeleting(null)
      }
    }
    setConfirmOpen(true)
  }

  const doConfirm = async () => {
    if (!pendingDelete.current) return
    setConfirmLoading(true)
    await pendingDelete.current()
    setConfirmLoading(false)
    setConfirmOpen(false)
    pendingDelete.current = null
  }

  const filtered = events.filter((e) =>
    !search || e.title.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir evento"
        message="Tem certeza que deseja excluir este evento? Todas as inscrições associadas também serão removidas. Esta ação não pode ser desfeita."
        confirmLabel="Excluir evento"
        loading={confirmLoading}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <div className="bg-primary pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Painel Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gerenciar Eventos</h1>
              <p className="text-primary-foreground/70 text-sm mt-1">{events.length} evento(s) cadastrado(s)</p>
            </div>
            <Link
              href="/admin/eventos/novo"
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Criar evento
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Search + refresh */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar evento…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={fetchEvents}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={cn('w-4 h-4 text-muted-foreground', loading && 'animate-spin')} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {search ? 'Nenhum evento encontrado.' : 'Nenhum evento cadastrado ainda.'}
            </p>
            {!search && (
              <Link href="/admin/eventos/novo"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Criar primeiro evento
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Evento</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Inscritos</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.startDate}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {event.enrolled} / {event.capacity}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', STATUS_CLASS[event.status] ?? STATUS_CLASS.rascunho)}>
                        {STATUS_LABEL[event.status] ?? event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/eventos/${event.slug}`}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Ver evento">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/eventos/${event.id}/editar`}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(Number(event.id), event.title)}
                          disabled={deleting === Number(event.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
