'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, RefreshCw, AlertCircle, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Palestrante {
  id: number; nome: string; area: string | null
  instituicao: string | null; email: string | null
}
interface Meta { total: number; page: number; perPage: number; totalPages: number; hasPrev: boolean; hasNext: boolean }

export default function AdminPalestrantesPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [palestrantes, setPalestrantes] = useState<Palestrante[]>([])
  const [meta, setMeta]   = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [page, setPage]   = useState(1)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingDelete = useRef<(() => Promise<void>) | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', area: '', instituicao: '', email: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace('/login?next=/admin/palestrantes')
  }, [user, isAdmin, authLoading, router])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ page: String(page), perPage: '15' })
      if (busca) params.set('busca', busca)
      const res = await apiFetch<{ data: Palestrante[]; meta: Meta }>(`/palestrantes?${params}`)
      setPalestrantes(res.data); setMeta(res.meta)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar palestrantes')
    } finally { setLoading(false) }
  }, [busca, page])

  useEffect(() => { if (user && isAdmin) fetchData() }, [user, isAdmin, fetchData])

  async function handleDelete(id: number, nome: string) {
    pendingDelete.current = async () => {
      setDeleting(id)
      try {
        await apiFetch(`/palestrantes/${id}`, { method: 'DELETE' })
        setPalestrantes(prev => prev.filter(p => p.id !== id))
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao excluir palestrante')
      } finally { setDeleting(null) }
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { setFormError('Nome é obrigatório.'); return }
    setSaving(true); setFormError('')
    try {
      const novo = await apiFetch<Palestrante>('/palestrantes', {
        method: 'POST',
        body: JSON.stringify({
          nome:        form.nome.trim(),
          area:        form.area || null,
          instituicao: form.instituicao || null,
          email:       form.email || null,
          bio:         form.bio || null,
        }),
      })
      setPalestrantes(prev => [novo, ...prev])
      setForm({ nome: '', area: '', instituicao: '', email: '', bio: '' })
      setShowForm(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Erro ao criar palestrante.')
    } finally { setSaving(false) }
  }

  if (authLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  const inputCls = 'w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="min-h-screen bg-background">
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir palestrante"
        message="Tem certeza que deseja excluir este palestrante? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={confirmLoading}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <div className="bg-primary pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao painel
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Palestrantes</h1>
              <p className="text-white/60 text-sm mt-1">Cadastro de palestrantes e facilitadores</p>
            </div>
            <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors">
              <Plus className="w-4 h-4" /> Novo palestrante
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Formulário inline de criação */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Novo Palestrante</h2>
            {formError && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {formError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome *</label>
                <input type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Dr. João Silva" className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Área</label>
                <input type="text" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Inteligência Artificial" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Instituição</label>
                <input type="text" value={form.instituicao} onChange={e => setForm(f => ({ ...f, instituicao: e.target.value }))} placeholder="Universidade Federal" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="joao@univ.edu.br" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} placeholder="Breve descrição do palestrante..." className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancelar</button>
              <button type="submit" disabled={saving} className={cn('px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors', saving && 'opacity-60 cursor-not-allowed')}>
                {saving ? 'Salvando...' : 'Criar Palestrante'}
              </button>
            </div>
          </form>
        )}

        {/* Filtro */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={busca} placeholder="Buscar por nome..." onChange={e => { setBusca(e.target.value); setPage(1) }} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={fetchData} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {error && <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">{meta ? `${meta.total} palestrante${meta.total !== 1 ? 's' : ''}` : ''}</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : palestrantes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Nenhum palestrante cadastrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Área</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instituição</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {palestrantes.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{p.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.area ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.instituicao ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.email ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(p.id, p.nome)} disabled={deleting === p.id} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
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
