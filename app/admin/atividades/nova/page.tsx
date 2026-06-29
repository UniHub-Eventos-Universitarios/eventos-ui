'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

const TIPOS = [
  { value: 'palestra',    label: 'Palestra' },
  { value: 'oficina',     label: 'Oficina' },
  { value: 'mesa_redonda',label: 'Mesa Redonda' },
  { value: 'minicurso',   label: 'Minicurso' },
]

interface Palestrante { id: number; nome: string }
interface Local       { id: number; nome: string }
interface Evento      { id: number; titulo: string }

interface FormState {
  evento_id: string; titulo: string; descricao: string
  tipo: string; trilha: string
  palestrante_id: string; local_id: string
  data: string; hora_inicio: string; hora_fim: string
  vagas: string; destaque: boolean
}

const EMPTY: FormState = {
  evento_id: '', titulo: '', descricao: '', tipo: 'palestra', trilha: '',
  palestrante_id: '', local_id: '',
  data: '', hora_inicio: '09:00', hora_fim: '10:00',
  vagas: '50', destaque: false,
}

export default function NovaAtividadePage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [form, setForm]   = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [palestrantes, setPalestrantes] = useState<Palestrante[]>([])
  const [locais, setLocais]             = useState<Local[]>([])
  const [eventos, setEventos]           = useState<Evento[]>([])

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace('/login?next=/admin/atividades/nova')
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    if (!user || !isAdmin) return
    Promise.all([
      apiFetch<{ data: Palestrante[] }>('/palestrantes?perPage=100').then(r => setPalestrantes(r.data)).catch(() => {}),
      apiFetch<{ data: Local[] }>('/locais?perPage=100').then(r => setLocais(r.data)).catch(() => {}),
      apiFetch<{ data: Evento[] }>('/eventos?perPage=100').then(r => setEventos(r.data)).catch(() => {}),
    ])
  }, [user, isAdmin])

  function set(field: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) { setStatus('error'); setErrorMsg('Título é obrigatório.'); return }
    if (!form.data)          { setStatus('error'); setErrorMsg('Data é obrigatória.'); return }
    setStatus('loading'); setErrorMsg('')
    try {
      await apiFetch('/atividades', {
        method: 'POST',
        body: JSON.stringify({
          evento_id:      form.evento_id     ? Number(form.evento_id)     : null,
          titulo:         form.titulo.trim(),
          descricao:      form.descricao     || null,
          tipo:           form.tipo,
          trilha:         form.trilha        || null,
          palestrante_id: form.palestrante_id ? Number(form.palestrante_id) : null,
          local_id:       form.local_id       ? Number(form.local_id)       : null,
          data:           form.data,
          hora_inicio:    form.hora_inicio,
          hora_fim:       form.hora_fim,
          vagas:          Number(form.vagas) || 0,
          destaque:       form.destaque,
        }),
      })
      setStatus('success')
      setTimeout(() => router.push('/admin/atividades'), 1500)
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao criar atividade.')
    }
  }

  if (authLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  const inputCls = 'w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelCls = 'block text-sm font-medium text-foreground mb-1'

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/atividades" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-2xl font-bold text-white">Nova Atividade</h1>
          <p className="text-white/60 text-sm mt-1">Cadastre uma palestra, oficina ou minicurso</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === 'success' && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-lg mb-6 border border-emerald-200 text-sm">
            <CheckCircle className="w-4 h-4" /> Atividade criada com sucesso! Redirecionando...
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg mb-6 text-sm">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          {/* Evento vinculado */}
          <div>
            <label className={labelCls}>Evento</label>
            <select value={form.evento_id} onChange={e => set('evento_id', e.target.value)} className={inputCls}>
              <option value="">Selecione um evento (opcional)</option>
              {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className={labelCls}>Título *</label>
            <input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ex: Introdução ao Machine Learning" className={inputCls} required />
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} rows={3} placeholder="Descreva brevemente o conteúdo..." className={inputCls} />
          </div>

          {/* Tipo + Trilha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo *</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Trilha</label>
              <input type="text" value={form.trilha} onChange={e => set('trilha', e.target.value)} placeholder="Ex: Segurança, IA, Cloud" className={inputCls} />
            </div>
          </div>

          {/* Palestrante + Local */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Palestrante</label>
              <select value={form.palestrante_id} onChange={e => set('palestrante_id', e.target.value)} className={inputCls}>
                <option value="">Sem palestrante</option>
                {palestrantes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Local</label>
              <select value={form.local_id} onChange={e => set('local_id', e.target.value)} className={inputCls}>
                <option value="">Sem local</option>
                {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Data + Horários */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Data *</label>
              <input type="date" value={form.data} onChange={e => set('data', e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Início</label>
              <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fim</label>
              <input type="time" value={form.hora_fim} onChange={e => set('hora_fim', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Vagas + Destaque */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vagas (0 = ilimitado)</label>
              <input type="number" min="0" value={form.vagas} onChange={e => set('vagas', e.target.value)} className={inputCls} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.destaque} onChange={e => set('destaque', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-medium text-foreground">Destacar na home</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/admin/atividades" className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancelar</Link>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={cn('inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors', (status === 'loading' || status === 'success') && 'opacity-60 cursor-not-allowed')}
            >
              <Save className="w-4 h-4" />
              {status === 'loading' ? 'Salvando...' : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
