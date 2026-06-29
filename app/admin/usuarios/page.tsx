'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, AlertCircle, Search, Shield, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Usuario {
  id: number
  nome: string
  email: string
  role: 'aluno' | 'professor' | 'admin'
  created_at: string
}

const ROLES: { value: string; label: string }[] = [
  { value: 'aluno',     label: 'Aluno' },
  { value: 'professor', label: 'Professor' },
  { value: 'admin',     label: 'Admin' },
]

const ROLE_COLORS: Record<string, string> = {
  admin:     'bg-violet-100 text-violet-700',
  professor: 'bg-sky-100 text-sky-700',
  aluno:     'bg-emerald-100 text-emerald-700',
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [usuarios, setUsuarios]   = useState<Usuario[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [busca, setBusca]         = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [deleting, setDeleting]   = useState<number | null>(null)
  const [updatingRole, setUpdatingRole] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')
  const [confirmLoading, setConfirmLoading] = useState(false)
  const pendingDelete = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace('/login?next=/admin/usuarios')
  }, [user, isAdmin, authLoading, router])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (filterRole) params.set('role', filterRole)
      const res = await apiFetch<{ data: Usuario[]; total: number }>(`/admin/usuarios?${params}`)
      setUsuarios(res.data); setTotal(res.total)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários')
    } finally { setLoading(false) }
  }, [filterRole])

  useEffect(() => { if (user && isAdmin) fetchData() }, [user, isAdmin, fetchData])

  const filtered = busca
    ? usuarios.filter(u =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
      )
    : usuarios

  async function handleRoleChange(id: number, role: string) {
    if (id === user?.id) { toast.warning('Você não pode alterar sua própria função.'); return }
    setUpdatingRole(id)
    try {
      const updated = await apiFetch<Usuario>(`/admin/usuarios/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, role: updated.role } : u))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar função')
    } finally { setUpdatingRole(null) }
  }

  async function handleDelete(id: number, nome: string) {
    if (id === user?.id) { toast.warning('Você não pode excluir sua própria conta.'); return }
    pendingDelete.current = async () => {
      setDeleting(id)
      try {
        await apiFetch(`/admin/usuarios/${id}`, { method: 'DELETE' })
        setUsuarios(prev => prev.filter(u => u.id !== id))
        setTotal(t => t - 1)
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao excluir usuário')
      } finally { setDeleting(null) }
    }
    setConfirmMsg(`Excluir o usuário "${nome}"? Esta ação remove permanentemente a conta e todos os dados associados.`)
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir usuário"
        message={confirmMsg}
        confirmLabel="Excluir conta"
        loading={confirmLoading}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <div className="bg-primary pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao painel
          </Link>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent" /> Usuários
              </h1>
              <p className="text-white/60 text-sm mt-1">Gerencie contas e permissões — {total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              placeholder="Buscar por nome ou e-mail..."
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todas as funções</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button onClick={fetchData} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {busca || filterRole ? 'Nenhum usuário encontrado com esses filtros.' : 'Nenhum usuário cadastrado.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Função</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cadastro</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(u => (
                    <tr key={u.id} className={cn('hover:bg-muted/30 transition-colors', u.id === user?.id && 'bg-primary/5')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                            {u.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{u.nome}</span>
                          {u.id === user?.id && <span className="text-xs text-muted-foreground">(você)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={u.id === user?.id || updatingRole === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60',
                            ROLE_COLORS[u.role] ?? 'bg-muted text-foreground'
                          )}
                        >
                          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        {updatingRole === u.id && <span className="ml-2 text-xs text-muted-foreground">Salvando...</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u.id, u.nome)}
                          disabled={deleting === u.id || u.id === user?.id}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={u.id === user?.id ? 'Não é possível excluir sua própria conta' : `Excluir ${u.nome}`}
                        >
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

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Exibindo {filtered.length} de {total} usuário{total !== 1 ? 's' : ''}
          </p>
        )}
      </main>
    </div>
  )
}
