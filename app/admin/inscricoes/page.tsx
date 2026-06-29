'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search, ArrowLeft, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, Trash2, CheckCircle, XCircle, Clock,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Inscricao {
  id: number
  atividade_id: number
  atividade_titulo: string
  nome_participante: string
  email: string
  telefone: string | null
  status: 'pendente' | 'confirmada' | 'cancelada'
  created_at: string
}

interface PaginaMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

interface ListResponse {
  data: Inscricao[]
  meta: PaginaMeta
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_OPTS = [
  { value: '',          label: 'Todos os status' },
  { value: 'pendente',  label: 'Pendente' },
  { value: 'confirmada',label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const SORT_OPTS = [
  { value: 'created_at:desc', label: 'Mais recentes' },
  { value: 'created_at:asc',  label: 'Mais antigas' },
  { value: 'nome_participante:asc', label: 'Nome A–Z' },
  { value: 'status:asc',      label: 'Status' },
]

const STATUS_ICON: Record<string, React.ReactNode> = {
  confirmada: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  cancelada:  <XCircle    className="w-3.5 h-3.5 text-red-500" />,
  pendente:   <Clock      className="w-3.5 h-3.5 text-amber-500" />,
}

const STATUS_CLASS: Record<string, string> = {
  confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelada:  'bg-red-50 text-red-700 border-red-200',
  pendente:   'bg-amber-50 text-amber-700 border-amber-200',
}

const PAGE_SIZE = 15

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AdminInscricoesPage() {
  return (
    <Suspense>
      <AdminInscricoesContent />
    </Suspense>
  )
}

function AdminInscricoesContent() {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()
  const { user, isAdmin, loading: authLoading } = useAuth()

  // Parâmetros de consulta (DBE2: filtros + ordenação + paginação)
  const [busca,  setBusca]  = useState(sp.get('busca')  ?? '')
  const [status, setStatus] = useState(sp.get('status') ?? '')
  const [sort,   setSort]   = useState(sp.get('sort')   ?? 'created_at:desc')
  const [page,   setPage]   = useState(Number(sp.get('page') ?? 1))

  const [result,   setResult]   = useState<ListResponse | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error,    setError]    = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingDelete = useRef<(() => Promise<void>) | null>(null)

  // Redireciona se não for admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/login?next=/admin/inscricoes')
    }
  }, [user, isAdmin, authLoading, router])

  // Sincroniza URL com os filtros ativos
  const syncUrl = useCallback((overrides: Record<string, string | number> = {}) => {
    const params = new URLSearchParams()
    const b = overrides.busca  !== undefined ? String(overrides.busca)  : busca
    const s = overrides.status !== undefined ? String(overrides.status) : status
    const o = overrides.sort   !== undefined ? String(overrides.sort)   : sort
    const p = overrides.page   !== undefined ? Number(overrides.page)   : page
    if (b) params.set('busca', b)
    if (s) params.set('status', s)
    if (o !== 'created_at:desc') params.set('sort', o)
    if (p > 1) params.set('page', String(p))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [busca, status, sort, page, pathname, router])

  // Busca os dados na API (DBE2: paginação + filtros + ordenação)
  const fetchData = useCallback(async (overrides: Record<string, string | number> = {}) => {
    setLoading(true)
    setError('')
    try {
      const b = overrides.busca  !== undefined ? String(overrides.busca)  : busca
      const s = overrides.status !== undefined ? String(overrides.status) : status
      const o = overrides.sort   !== undefined ? String(overrides.sort)   : sort
      const p = overrides.page   !== undefined ? Number(overrides.page)   : page

      const [sortField, sortDir] = o.split(':')
      const params = new URLSearchParams({
        page:    String(p),
        perPage: String(PAGE_SIZE),
        sort:    sortField,
        order:   sortDir.toUpperCase(),
      })
      if (b) params.set('busca', b)
      if (s) params.set('status', s)

      const data = await apiFetch<ListResponse>(`/inscricoes?${params.toString()}`)
      setResult(data)
    } catch {
      setError('Não foi possível carregar as inscrições.')
    } finally {
      setLoading(false)
    }
  }, [busca, status, sort, page])

  // Carrega ao montar e quando filtros mudam
  useEffect(() => {
    if (!authLoading && isAdmin) fetchData()
  }, [authLoading, isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBusca = (value: string) => {
    setBusca(value)
    setPage(1)
    syncUrl({ busca: value, page: 1 })
    fetchData({ busca: value, page: 1 })
  }

  const handleStatus = (value: string) => {
    setStatus(value)
    setPage(1)
    syncUrl({ status: value, page: 1 })
    fetchData({ status: value, page: 1 })
  }

  const handleSort = (value: string) => {
    setSort(value)
    setPage(1)
    syncUrl({ sort: value, page: 1 })
    fetchData({ sort: value, page: 1 })
  }

  const handlePage = (p: number) => {
    setPage(p)
    syncUrl({ page: p })
    fetchData({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: number, nome: string) => {
    pendingDelete.current = async () => {
      setDeleting(id)
      try {
        await apiFetch(`/inscricoes/${id}`, { method: 'DELETE' })
        fetchData()
      } catch {
        toast.error('Não foi possível excluir a inscrição.')
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

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const meta = result?.meta
  const inscricoes = result?.data ?? []

  // Paginação: array de páginas com elipses
  const buildPages = (): (number | '...')[] => {
    if (!meta || meta.totalPages <= 7) {
      return Array.from({ length: meta?.totalPages ?? 0 }, (_, i) => i + 1)
    }
    const pages: (number | '...')[] = [1]
    if (meta.page > 3) pages.push('...')
    const start = Math.max(2, meta.page - 1)
    const end   = Math.min(meta.totalPages - 1, meta.page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (meta.page < meta.totalPages - 2) pages.push('...')
    pages.push(meta.totalPages)
    return pages
  }

  return (
    <div className="min-h-screen bg-background">
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir inscrição"
        message="Tem certeza que deseja excluir esta inscrição? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={confirmLoading}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Header */}
      <div className="bg-primary pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Painel Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Inscrições</h1>
              <p className="text-primary-foreground/70 text-sm mt-1">
                {meta ? `${meta.total} inscrição(ões) encontrada(s)` : 'Carregando…'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filtros (DBE2) */}
        <div className="flex flex-wrap gap-3 mb-5">

          {/* Busca por nome */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Buscar por nome do participante…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Filtro de status (DBE2) */}
          <select
            value={status}
            onChange={(e) => handleStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            aria-label="Filtrar por status"
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Ordenação (DBE2) */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            aria-label="Ordenar por"
          >
            {SORT_OPTS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchData()}
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

        {!loading && inscricoes.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Nenhuma inscrição encontrada com os filtros aplicados.
          </div>
        )}

        {!loading && inscricoes.length > 0 && (
          <>
            {/* Tabela de inscrições */}
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Participante</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Atividade</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Telefone</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inscricoes.map((ins) => (
                    <tr key={ins.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{ins.nome_participante}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ins.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        <p className="line-clamp-1">{ins.atividade_titulo ?? `Atividade #${ins.atividade_id}`}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {ins.telefone ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
                          STATUS_CLASS[ins.status] ?? 'bg-muted text-muted-foreground border-border'
                        )}>
                          {STATUS_ICON[ins.status]}
                          {ins.status.charAt(0).toUpperCase() + ins.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                        {new Date(ins.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(ins.id, ins.nome_participante)}
                            disabled={deleting === ins.id}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            title="Excluir inscrição"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação (DBE2) */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Exibindo{' '}
                  <span className="font-medium text-foreground">
                    {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.total)}
                  </span>{' '}
                  de <span className="font-medium text-foreground">{meta.total}</span> inscrições
                </p>

                <nav className="flex items-center gap-1" aria-label="Paginação de inscrições">
                  <button
                    onClick={() => handlePage(meta.page - 1)}
                    disabled={!meta.hasPrev}
                    className={cn(
                      'p-2 rounded-lg border transition-colors',
                      !meta.hasPrev
                        ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                        : 'border-border text-foreground hover:bg-muted'
                    )}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {buildPages().map((p, i) =>
                    p === '...' ? (
                      <span key={`el-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePage(p)}
                        aria-current={p === meta.page ? 'page' : undefined}
                        className={cn(
                          'w-9 h-9 rounded-lg border text-sm font-medium transition-colors',
                          p === meta.page
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-foreground hover:bg-muted'
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePage(meta.page + 1)}
                    disabled={!meta.hasNext}
                    className={cn(
                      'p-2 rounded-lg border transition-colors',
                      !meta.hasNext
                        ? 'border-border text-muted-foreground/40 cursor-not-allowed'
                        : 'border-border text-foreground hover:bg-muted'
                    )}
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
