// ─── Types ────────────────────────────────────────────────────────────────────

export type EventStatus = 'ativo' | 'encerrado' | 'cancelado' | 'rascunho'

export type EventCategory =
  | 'Congresso'
  | 'Simpósio'
  | 'Oficina'
  | 'Palestra'
  | 'Seminário'
  | 'Semana Acadêmica'
  | 'Feira'

export interface Speaker {
  id: string
  name: string
  title: string
  institution: string
  bio: string
  avatar?: string
}

export interface Workshop {
  id: string
  title: string
  instructor: string
  description: string
  capacity: number
  enrolled: number
  location: string
  startTime: string
  endTime: string
  day: string // "YYYY-MM-DD"
}

export interface ScheduleItem {
  id: string
  day: string // "YYYY-MM-DD"
  time: string
  title: string
  speaker?: string
  location: string
  type: 'palestra' | 'abertura' | 'encerramento' | 'intervalo' | 'oficina' | 'painel'
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string
  category: EventCategory
  courses: string[]
  image: string
  startDate: string   // "YYYY-MM-DD"
  endDate: string     // "YYYY-MM-DD"
  startTime: string   // "HH:MM"
  endTime: string
  location: string
  locationDetail: string
  mapUrl: string
  speakers: Speaker[]
  workshops: Workshop[]
  schedule: ScheduleItem[]
  capacity: number
  enrolled: number
  status: EventStatus
  tags: string[]
  organizerName: string
  organizerEmail: string
  createdAt: string
  updatedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isExpired(event: Event): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(event.endDate + 'T23:59:59')
  return end < today
}

export function getComputedStatus(event: Event): EventStatus {
  if (event.status === 'cancelado' || event.status === 'rascunho') return event.status
  if (isExpired(event)) return 'encerrado'
  return 'ativo'
}

export function getStatusBadge(status: EventStatus): { label: string; classes: string } {
  const map: Record<EventStatus, { label: string; classes: string }> = {
    ativo:     { label: 'Ativo',     classes: 'bg-[#E8F4FD] text-[#1B3A6B] border border-[#4A90D9]' },
    encerrado: { label: 'Encerrado', classes: 'bg-[#EDF2F7] text-[#5B7A99] border border-[#C8D9EE]' },
    cancelado: { label: 'Cancelado', classes: 'bg-red-50 text-red-700 border border-red-200' },
    rascunho:  { label: 'Rascunho',  classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  }
  return map[status]
}

export function getCategoryBadge(category: EventCategory): string {
  const map: Record<EventCategory, string> = {
    'Congresso':          'bg-[#1B3A6B] text-white',
    'Simpósio':           'bg-[#2756A6] text-white',
    'Oficina':            'bg-[#4A90D9] text-white',
    'Palestra':           'bg-[#5B7A99] text-white',
    'Seminário':          'bg-[#E8F4FD] text-[#1B3A6B] border border-[#4A90D9]',
    'Semana Acadêmica':   'bg-[#0D1B35] text-white',
    'Feira':              'bg-[#EDF2F7] text-[#1B3A6B] border border-[#C8D9EE]',
  }
  return map[category] ?? 'bg-muted text-muted-foreground'
}

// ─── Constantes de UI ─────────────────────────────────────────────────────────

export const ALL_CATEGORIES: EventCategory[] = [
  'Congresso', 'Simpósio', 'Oficina', 'Palestra', 'Seminário', 'Semana Acadêmica', 'Feira',
]

export const ALL_COURSES = [
  'Todos os cursos',
  'Ciência da Computação',
  'Engenharia de Software',
  'Sistemas de Informação',
  'Engenharia Elétrica',
  'Direito',
  'Psicologia',
  'Medicina',
  'Enfermagem',
  'Farmácia',
  'Biomedicina',
  'Biologia',
  'Nutrição',
  'Pedagogia',
  'Licenciaturas',
  'Ciências Sociais',
  'Relações Internacionais',
  'Serviço Social',
]
