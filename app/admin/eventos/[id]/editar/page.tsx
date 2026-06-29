'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { updateEvento, getEventoById } from '@/lib/api'
import type { BackendEvento } from '@/lib/api'
import { cn } from '@/lib/utils'

const CATEGORIAS = [
  'Congresso', 'Simpósio', 'Oficina', 'Palestra',
  'Seminário', 'Semana Acadêmica', 'Feira',
]

const STATUS_OPTS = [
  { value: 'rascunho',  label: 'Rascunho' },
  { value: 'ativo',     label: 'Ativo (inscrições abertas)' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface FormState {
  titulo: string
  descricao: string
  descricao_longa: string
  categoria: string
  status: string
  data_inicio: string
  data_fim: string
  hora_inicio: string
  hora_fim: string
  local_detalhe: string
  mapa_url: string
  capacidade: string
  organizador_nome: string
  organizador_email: string
  imagem_url: string
  tags: string
  destaque: boolean
}

const EMPTY: FormState = {
  titulo: '', descricao: '', descricao_longa: '',
  categoria: 'Seminário', status: 'rascunho',
  data_inicio: '', data_fim: '', hora_inicio: '08:00', hora_fim: '18:00',
  local_detalhe: '', mapa_url: '', capacidade: '100',
  organizador_nome: '', organizador_email: '',
  imagem_url: '', tags: '', destaque: false,
}

function formFromEvento(ev: BackendEvento): FormState {
  return {
    titulo:           ev.titulo,
    descricao:        ev.descricao ?? '',
    descricao_longa:  ev.descricao_longa ?? '',
    categoria:        ev.categoria ?? 'Seminário',
    status:           ev.status ?? 'rascunho',
    data_inicio:      ev.data_inicio?.slice(0, 10) ?? '',
    data_fim:         ev.data_fim?.slice(0, 10) ?? '',
    hora_inicio:      ev.hora_inicio?.slice(0, 5) ?? '08:00',
    hora_fim:         ev.hora_fim?.slice(0, 5) ?? '18:00',
    local_detalhe:    ev.local_detalhe ?? '',
    mapa_url:         ev.mapa_url ?? '',
    capacidade:       String(ev.capacidade ?? 100),
    organizador_nome: ev.organizador_nome ?? '',
    organizador_email:ev.organizador_email ?? '',
    imagem_url:       ev.imagem_url ?? '',
    tags:             (ev.tags ?? []).join(', '),
    destaque:         ev.destaque ?? false,
  }
}

export default function EditarEventoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [form, setForm]           = useState<FormState>(EMPTY)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/login?next=/admin/eventos')
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    if (authLoading || !isAdmin || !params.id) return
    setLoadingData(true)
    getEventoById(Number(params.id))
      .then((ev) => { if (ev) setForm(formFromEvento(ev)) })
      .catch(() => setError('Não foi possível carregar os dados do evento.'))
      .finally(() => setLoadingData(false))
  }, [authLoading, isAdmin, params.id])

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.titulo.trim()) { setError('O título é obrigatório.'); return }
    if (!form.data_inicio)   { setError('A data de início é obrigatória.'); return }
    if (!form.data_fim)      { setError('A data de fim é obrigatória.'); return }
    if (form.data_fim < form.data_inicio) { setError('A data de fim não pode ser anterior à data de início.'); return }

    setSaving(true)
    try {
      await updateEvento(Number(params.id), {
        titulo:           form.titulo.trim(),
        descricao:        form.descricao.trim() || undefined,
        descricao_longa:  form.descricao_longa.trim() || undefined,
        categoria:        form.categoria,
        status:           form.status,
        data_inicio:      form.data_inicio,
        data_fim:         form.data_fim,
        hora_inicio:      form.hora_inicio,
        hora_fim:         form.hora_fim,
        local_detalhe:    form.local_detalhe.trim() || undefined,
        mapa_url:         form.mapa_url.trim() || undefined,
        capacidade:       Number(form.capacidade) || 100,
        organizador_nome: form.organizador_nome.trim() || undefined,
        organizador_email:form.organizador_email.trim() || undefined,
        imagem_url:       form.imagem_url.trim() || undefined,
        tags:             form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) as unknown as string[] : [],
        destaque:         form.destaque,
      })
      setSuccess(true)
      setTimeout(() => router.push('/admin/eventos'), 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg || 'Não foi possível salvar o evento. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Evento atualizado!</h2>
          <p className="text-muted-foreground text-sm">Redirecionando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/eventos"
            className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para eventos
          </Link>
          <h1 className="text-2xl font-bold text-white">Editar evento</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">Altere as informações do evento acadêmico</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingData ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Informações básicas */}
            <Section title="Informações básicas">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Título *" id="titulo">
                    <input id="titulo" type="text" value={form.titulo}
                      onChange={(e) => set('titulo', e.target.value)}
                      placeholder="Ex: VII Congresso de Ciências da Computação"
                      className={inputCls} required />
                  </Field>
                </div>

                <Field label="Categoria" id="categoria">
                  <select id="categoria" value={form.categoria}
                    onChange={(e) => set('categoria', e.target.value)} className={inputCls}>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Status" id="status">
                  <select id="status" value={form.status}
                    onChange={(e) => set('status', e.target.value)} className={inputCls}>
                    {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Descrição curta" id="descricao">
                    <textarea id="descricao" rows={2} value={form.descricao}
                      onChange={(e) => set('descricao', e.target.value)}
                      placeholder="Breve descrição exibida nos cards do evento"
                      className={cn(inputCls, 'resize-none')} />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Descrição completa" id="descricao_longa">
                    <textarea id="descricao_longa" rows={4} value={form.descricao_longa}
                      onChange={(e) => set('descricao_longa', e.target.value)}
                      placeholder="Descrição detalhada exibida na página do evento"
                      className={cn(inputCls, 'resize-none')} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Datas e horários */}
            <Section title="Datas e horários">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Data de início *" id="data_inicio">
                  <input id="data_inicio" type="date" value={form.data_inicio}
                    onChange={(e) => set('data_inicio', e.target.value)}
                    className={inputCls} required />
                </Field>
                <Field label="Data de fim *" id="data_fim">
                  <input id="data_fim" type="date" value={form.data_fim}
                    onChange={(e) => set('data_fim', e.target.value)}
                    className={inputCls} required />
                </Field>
                <Field label="Horário início" id="hora_inicio">
                  <input id="hora_inicio" type="time" value={form.hora_inicio}
                    onChange={(e) => set('hora_inicio', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Horário fim" id="hora_fim">
                  <input id="hora_fim" type="time" value={form.hora_fim}
                    onChange={(e) => set('hora_fim', e.target.value)} className={inputCls} />
                </Field>
              </div>
            </Section>

            {/* Local */}
            <Section title="Local">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Endereço / Localização" id="local_detalhe">
                    <input id="local_detalhe" type="text" value={form.local_detalhe}
                      onChange={(e) => set('local_detalhe', e.target.value)}
                      placeholder="Ex: Auditório Principal, Bloco A — UFPEL"
                      className={inputCls} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="URL do mapa (Google Maps)" id="mapa_url">
                    <input id="mapa_url" type="url" value={form.mapa_url}
                      onChange={(e) => set('mapa_url', e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className={inputCls} />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Capacidade e organização */}
            <Section title="Capacidade e organizador">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Capacidade total" id="capacidade">
                  <input id="capacidade" type="number" min={1} value={form.capacidade}
                    onChange={(e) => set('capacidade', e.target.value)}
                    className={inputCls} />
                </Field>
                <Field label="Nome do organizador" id="org_nome">
                  <input id="org_nome" type="text" value={form.organizador_nome}
                    onChange={(e) => set('organizador_nome', e.target.value)}
                    placeholder="Ex: Dept. de Computação" className={inputCls} />
                </Field>
                <Field label="E-mail do organizador" id="org_email">
                  <input id="org_email" type="email" value={form.organizador_email}
                    onChange={(e) => set('organizador_email', e.target.value)}
                    placeholder="organizador@uni.edu.br" className={inputCls} />
                </Field>
              </div>
            </Section>

            {/* Extras */}
            <Section title="Mídia e extras">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="URL da imagem de capa" id="imagem_url">
                    <input id="imagem_url" type="url" value={form.imagem_url}
                      onChange={(e) => set('imagem_url', e.target.value)}
                      placeholder="https://..." className={inputCls} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Tags (separadas por vírgula)" id="tags">
                    <input id="tags" type="text" value={form.tags}
                      onChange={(e) => set('tags', e.target.value)}
                      placeholder="tecnologia, inovação, programação" className={inputCls} />
                  </Field>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={form.destaque}
                    onChange={(e) => set('destaque', e.target.checked)}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm font-medium text-foreground">Destacar na página inicial</span>
                </label>
              </div>
            </Section>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/admin/eventos"
                className="px-5 py-2.5 border border-border text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors">
                Cancelar
              </Link>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-colors'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 text-primary">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
