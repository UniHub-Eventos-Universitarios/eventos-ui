'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, RefreshCw, AlertCircle, Search, Pencil } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Atividade {
  id: number
  titulo: string
  tipo: string
  trilha: string | null
  data: string
  hora_inicio: string
  hora_fim: string
  vagas: number
  inscritos: number
  vagas_restantes: number
  palestrante_nome: string | null
  local_nome: string | null
  destaque: boolean
}

interface Meta { total: number; page: number; perPage: number; totalPages: number; hasPrev: boolean; hasNext: boolean }

const TIPO_LABEL: Record<string, string> = {
  palestra: 'Palestra', oficina: 'Oficina',
  mesa_redonda: 'Mesa Redonda', minicurso: 'Minicurso',
}

const TIPOS = Object.keys(TIPO_LABEL)

export default function AdminAtividadesPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [meta, setMeta]             = useState<Meta | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [busca, setBusca]           = useState('')
  const [tipo, setTipo]             = useState('')
  const [page, setPage]             = useState(1)
  const [deleting, setDeleting]     = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingDelete = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace('/login?next=/admin/atividades')
  }, [user, isAdmin, authLoading, router])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), perPage: '15' })
      if (busca) params.set('busca', busca)
      if (tipo)  params.set('tipo', tipo)
      const res = await apiFetch<{ data: Atividade[]; meta: Meta }>(`/atividades?${params}`)
      setAtividades(res.data)
      setMeta(res.meta)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar atividades')
    } finally {
      setLoading(false)
    }
  }, [busca, tipo, page])

  useEffect(() => { if (user && isAdmin) fetchData() }, [user, isAdmin, fetchData])

  async function handleDelete(id: number, titulo: string) {
    pendingDelete.current = async () => {
      setDeleting(id)
      try {
        await apiFetch(`/atividades/${id}`, { method: 'DELETE' })
        setAtividades(prev => prev.filter(a => a.id !== id))
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao excluir atividade')
      } finally {
        setDeleting(null)
      }
    }
    setConfirmOpen(true)
  }

  async function doConfirm() {
    if (!pendingDelete.current) return
    setConfirmLoading(true)
    await pendingDelete.current()
    setConfirmLoading(false)
    setConfirmOpen(false)
    pendingDelete.current = null
  }

  if (authLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-background">
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir atividade"
        message="Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={confirmLoading}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <div className="bg-primary pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao painel
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Atividades</h1>
              <p className="text-white/60 text-sm mt-1">Palestras, oficinas e minicursos cadastrados</p>
            </div>
            <Link href="/admin/atividades/nova" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors">
              <Plus className="w-4 h-4" /> Nova atividade
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={busca} placeholder="Buscar por título..."
              onChange={e => { setBusca(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={tipo} onChange={e => { setTipo(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todos os tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
          </select>
          <button onClick={fetchData} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors" title="Recarregar">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {meta ? `${meta.total} atividade${meta.total !== 1 ? 's' : ''} encontrada${meta.total !== 1 ? 's' : ''}` : ''}
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : atividades.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Nenhuma atividade encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Horário</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vagas</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Palestrante</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {atividades.map(a => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-xs">
                        <span className="line-clamp-1">{a.titulo}</span>
                        {a.trilha && <span className="text-xs text-muted-foreground block">Trilha: {a.trilha}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {TIPO_LABEL[a.tipo] ?? a.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.data}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.hora_inicio}–{a.hora_fim}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.inscritos}/{a.vagas > 0 ? a.vagas : '∞'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.palestrante_nome ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/atividades/${a.id}/editar`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(a.id, a.titulo)}
                            disabled={deleting === a.id}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            title="Excluir"
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
          )}
        </div>

        {/* Paginação */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">Página {meta.page} de {meta.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={!meta.hasPrev} className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={!meta.hasNext} className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors">Próximo</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
