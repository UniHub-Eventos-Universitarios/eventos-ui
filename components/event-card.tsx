import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type Event, getComputedStatus, getStatusBadge, getCategoryBadge } from '@/lib/data'

interface EventCardProps {
  event: Event
}

function formatDateRange(start: string, end: string): string {
  const s = parseISO(start)
  const e = parseISO(end)
  if (start === end) return format(s, "d 'de' MMM", { locale: ptBR })
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${format(s, 'd')} – ${format(e, "d 'de' MMM", { locale: ptBR })}`
  }
  return `${format(s, "d MMM", { locale: ptBR })} – ${format(e, "d MMM yyyy", { locale: ptBR })}`
}

export function EventCard({ event }: EventCardProps) {
  const computed      = getComputedStatus(event)
  const statusBadge   = getStatusBadge(computed)
  const categoryClass = getCategoryBadge(event.category)
  const enrolled  = event.enrolled  ?? 0
  const capacity  = event.capacity  ?? 0
  const occupancy = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0
  const expired   = computed === 'encerrado' || computed === 'cancelado'

  return (
    <article
      className={`group flex flex-col rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-primary/40 dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]${expired ? ' opacity-60' : ''}`}
    >
      {/* Imagem */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted">
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105${expired ? ' grayscale' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent flex items-center justify-center">
            <Calendar className="w-10 h-10 text-primary/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${statusBadge.classes}`}>
            {statusBadge.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${categoryClass}`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold leading-snug text-foreground text-pretty line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        {/* Metadados */}
        <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
            <span>{event.startTime} – {event.endTime}</span>
          </li>
          <li className="flex items-center gap-2 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
            <span>{enrolled} / {capacity > 0 ? capacity : '∞'} inscritos</span>
          </li>
        </ul>

        {/* Barra de ocupação */}
        {capacity > 0 && (
          <div className="space-y-1">
            <div
              className="h-1 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={occupancy}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all ${
                  occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${occupancy}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{occupancy}% das vagas preenchidas</p>
          </div>
        )}
        {capacity === 0 && (
          <p className="text-[10px] text-muted-foreground">Vagas ilimitadas</p>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-1 mt-auto">
          <Link
            href={`/eventos/${event.slug}`}
            className="flex-1 flex items-center justify-center rounded-lg border border-border bg-transparent py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Ver detalhes
          </Link>
          {!expired && (
            <Link
              href={`/eventos/${event.slug}`}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Inscrever-se <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
