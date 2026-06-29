'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, parseISO, getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type Event, getComputedStatus } from '@/lib/data'

interface MiniCalendarProps {
  events: Event[]
  selectedDate?: Date | null
  onSelectDate?: (date: Date | null) => void
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function MiniCalendar({ events, selectedDate = null, onSelectDate = () => {} }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date())

  const monthStart = startOfMonth(viewDate)
  const monthEnd   = endOfMonth(viewDate)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startOffset = getDay(monthStart)

  const eventDaySet = new Set<string>()
  events.forEach(ev => {
    try {
      const s = parseISO(ev.startDate)
      const e = parseISO(ev.endDate)
      eachDayOfInterval({ start: s, end: e }).forEach(d => {
        eventDaySet.add(format(d, 'yyyy-MM-dd'))
      })
    } catch { /* noop */ }
  })

  const activeDaySet = new Set<string>()
  events.forEach(ev => {
    if (getComputedStatus(ev) === 'ativo') {
      try {
        const s = parseISO(ev.startDate)
        const e = parseISO(ev.endDate)
        eachDayOfInterval({ start: s, end: e }).forEach(d => {
          activeDaySet.add(format(d, 'yyyy-MM-dd'))
        })
      } catch { /* noop */ }
    }
  })

  const prev = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const next = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  const toggle = (day: Date) =>
    onSelectDate(selectedDate && isSameDay(day, selectedDate) ? null : day)

  const monthEvents = events
    .filter(ev => {
      try { return parseISO(ev.startDate) >= monthStart && parseISO(ev.startDate) <= monthEnd }
      catch { return false }
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="p-4">
        {/* Cabeçalho */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prev}
            aria-label="Mês anterior"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold capitalize text-foreground">
            {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={next}
            aria-label="Próximo mês"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1 text-[10px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`off-${i}`} />)}
          {days.map(day => {
            const key        = format(day, 'yyyy-MM-dd')
            const isActive   = activeDaySet.has(key)
            const hasAny     = eventDaySet.has(key)
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
            const today      = isToday(day)

            return (
              <button
                key={key}
                onClick={() => toggle(day)}
                className={`relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : today
                    ? 'border border-primary text-primary font-semibold hover:bg-accent'
                    : hasAny
                    ? 'text-foreground hover:bg-muted'
                    : 'text-muted-foreground hover:bg-muted/60'
                }`}
                aria-label={format(day, "d 'de' MMMM", { locale: ptBR })}
                aria-pressed={isSelected}
              >
                {format(day, 'd')}
                {hasAny && !isSelected && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      isActive ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Ativo
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            Encerrado
          </span>
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="ml-auto text-[11px] text-primary hover:underline"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Lista de eventos do mês */}
      {monthEvents.length > 0 && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Neste mês
          </p>
          <ul className="space-y-2">
            {monthEvents.map(ev => (
              <li key={ev.id}>
                <a href={`/eventos/${ev.slug}`} className="flex items-center gap-2 group">
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    getComputedStatus(ev) === 'ativo' ? 'bg-primary' : 'bg-border'
                  }`} />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                    <strong className="text-foreground font-medium">
                      {format(parseISO(ev.startDate), 'dd/MM')}
                    </strong>
                    {' '}— {ev.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
