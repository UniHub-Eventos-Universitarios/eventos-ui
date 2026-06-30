/**
 * Cliente HTTP para a API Eventus.
 * Mapeia as respostas do backend (snake_case) para os tipos do frontend (camelCase).
 */

import type { Event, EventCategory, Speaker, Workshop, ScheduleItem } from './data'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'

// ─── helpers ──────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('eventus_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = body.error?.message ?? body.message ?? 'Erro na requisição'
    const details = body.error?.details ?? body.details
    throw new ApiError(res.status, msg, details)
  }
  if (res.status === 204) return undefined as T
  return res.json() as T
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Tipos do backend ─────────────────────────────────────────────────────────

export interface BackendEvento {
  id: number
  slug: string
  titulo: string
  descricao: string | null
  descricao_longa: string | null
  categoria: string
  cursos: string[] | null
  imagem_url: string | null
  data_inicio: string
  data_fim: string
  hora_inicio: string
  hora_fim: string
  local_nome: string | null
  local_detalhe: string | null
  mapa_url: string | null
  capacidade: number
  status: string
  tags: string[] | null
  organizador_nome: string | null
  organizador_email: string | null
  destaque: boolean
  inscritos: number
  vagas_restantes: number
  palestrante_ids?: number[]
  palestrantes?: BackendPalestrante[]
  atividades?: BackendAtividade[]
  created_at: string
  updated_at: string
}

export interface BackendPalestrante {
  id: number
  nome: string
  bio: string | null
  instituicao: string | null
  area: string | null
  foto_url: string | null
}

export interface BackendAtividade {
  id: number
  evento_id: number | null
  titulo: string
  descricao: string | null
  tipo: 'palestra' | 'oficina' | 'mesa_redonda' | 'minicurso'
  trilha: string | null
  data: string
  hora_inicio: string
  hora_fim: string
  vagas: number
  inscritos: number
  vagas_restantes: number
  palestrante_nome: string | null
  local_nome: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
}

// ─── Mapeamento backend → frontend ────────────────────────────────────────────

const TIPO_TO_SCHEDULE: Record<string, ScheduleItem['type']> = {
  palestra:     'palestra',
  oficina:      'oficina',
  minicurso:    'oficina',
  mesa_redonda: 'painel',
}

export function mapEvento(ev: BackendEvento): Event {
  const atividades = ev.atividades ?? []
  const palestrantes = ev.palestrantes ?? []

  const speakers: Speaker[] = palestrantes.map((p) => ({
    id:          String(p.id),
    name:        p.nome,
    title:       p.area ?? '',
    institution: p.instituicao ?? '',
    bio:         p.bio ?? '',
    avatar:      p.foto_url ?? undefined,
  }))

  const workshops: Workshop[] = atividades
    .filter((a) => a.tipo === 'oficina' || a.tipo === 'minicurso')
    .map((a) => ({
      id:          String(a.id),
      title:       a.titulo,
      instructor:  a.palestrante_nome ?? '',
      description: a.descricao ?? '',
      capacity:    a.vagas,
      enrolled:    a.inscritos,
      location:    a.local_nome ?? '',
      startTime:   a.hora_inicio,
      endTime:     a.hora_fim,
      day:         a.data,
    }))

  const schedule: ScheduleItem[] = atividades.map((a) => ({
    id:       String(a.id),
    day:      a.data,
    time:     a.hora_inicio,
    title:    a.titulo,
    speaker:  a.palestrante_nome ?? undefined,
    location: a.local_nome ?? '',
    type:     TIPO_TO_SCHEDULE[a.tipo] ?? 'palestra',
  }))

  return {
    id:              String(ev.id),
    slug:            ev.slug,
    title:           ev.titulo,
    description:     ev.descricao ?? '',
    longDescription: ev.descricao_longa ?? ev.descricao ?? '',
    category:        ev.categoria as EventCategory,
    courses:         ev.cursos ?? [],
    image:           ev.imagem_url ?? '',
    startDate:       ev.data_inicio,
    endDate:         ev.data_fim,
    startTime:       ev.hora_inicio,
    endTime:         ev.hora_fim,
    location:        ev.local_nome ?? ev.local_detalhe ?? '',
    locationDetail:  ev.local_detalhe ?? '',
    mapUrl:          ev.mapa_url ?? '',
    speakers,
    workshops,
    schedule,
    capacity:        ev.capacidade,
    enrolled:        ev.inscritos,
    status:          ev.status as Event['status'],
    tags:            ev.tags ?? [],
    organizerName:   ev.organizador_nome ?? '',
    organizerEmail:  ev.organizador_email ?? '',
    createdAt:       ev.created_at,
    updatedAt:       ev.updated_at,
  }
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

export async function getEventos(params?: Record<string, string>): Promise<PaginatedResponse<Event>> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await apiFetch<PaginatedResponse<BackendEvento>>(`/eventos${qs}`)
  return { ...res, data: res.data.map(mapEvento) }
}

export async function getEventoById(id: number): Promise<BackendEvento | null> {
  try {
    return await apiFetch<BackendEvento>(`/eventos/id/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function getEventoBySlug(slug: string): Promise<Event | null> {
  try {
    const ev = await apiFetch<BackendEvento>(`/eventos/${slug}`)
    return mapEvento(ev)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function createEvento(data: Partial<BackendEvento>): Promise<BackendEvento> {
  return apiFetch('/eventos', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateEvento(id: number, data: Partial<BackendEvento>): Promise<BackendEvento> {
  return apiFetch(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteEvento(id: number): Promise<void> {
  return apiFetch(`/eventos/${id}`, { method: 'DELETE' })
}

export interface BackendPalestranteSimples {
  id: number
  nome: string
  area: string | null
  instituicao: string | null
}

export async function getPalestrantes(): Promise<BackendPalestranteSimples[]> {
  const res = await apiFetch<{ data: BackendPalestranteSimples[] }>('/palestrantes?perPage=200')
  return res.data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string
  user: { id: number; nome: string; email: string; role: string }
}

export async function apiLogin(email: string, senha: string): Promise<AuthResponse> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) })
}

export async function apiRegister(nome: string, email: string, senha: string): Promise<{ id: number; nome: string; email: string; role: string }> {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ nome, email, senha }) })
}

export async function apiMe(): Promise<{ id: number; nome: string; email: string; role: string }> {
  return apiFetch('/auth/me')
}

// ─── Participacoes (confirmacao no evento) ────────────────────────────────────

export async function statusParticipacao(eventoId: number): Promise<{ participando: boolean }> {
  return apiFetch(`/eventos/${eventoId}/participar`)
}

export async function confirmarParticipacao(eventoId: number): Promise<{ id: number }> {
  return apiFetch(`/eventos/${eventoId}/participar`, { method: 'POST' })
}

export async function cancelarParticipacao(eventoId: number): Promise<void> {
  return apiFetch(`/eventos/${eventoId}/participar`, { method: 'DELETE' })
}

// ─── Inscricoes ───────────────────────────────────────────────────────────────

export async function criarInscricao(data: {
  atividade_id: number
  nome_participante: string
  email: string
  telefone?: string
}): Promise<unknown> {
  return apiFetch('/inscricoes', { method: 'POST', body: JSON.stringify(data) })
}

// ─── Presencas ────────────────────────────────────────────────────────────────

export async function marcarPresenca(atividade_id: number): Promise<unknown> {
  return apiFetch('/presencas', { method: 'POST', body: JSON.stringify({ atividade_id }) })
}

export async function cancelarPresenca(atividade_id: number): Promise<void> {
  return apiFetch('/presencas', { method: 'DELETE', body: JSON.stringify({ atividade_id }) })
}

export async function minhasPresencas(): Promise<unknown[]> {
  return apiFetch('/auth/me/presencas')
}

// ─── Meus eventos (participacoes confirmadas) ─────────────────────────────────

export interface MeuEvento {
  id: number
  usuario_id: number
  evento_id: number
  created_at: string
  eventos: {
    id: number
    slug: string
    titulo: string
    data_inicio: string
    data_fim: string
    hora_inicio: string
    hora_fim: string
    status: string
    categoria: string
  }
}

export async function meusEventos(): Promise<MeuEvento[]> {
  return apiFetch('/auth/me/eventos')
}
