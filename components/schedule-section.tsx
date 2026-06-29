'use client'

import { useState } from 'react'
import { Clock, MapPin, Mic, Coffee, Users, BookOpen, Star, Flag, Play } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ScheduleItem } from '@/lib/data'

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; dot: string }> = {
  palestra:     { label: 'Palestra',      icon: Mic,     color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-500'   },
  keynote:      { label: 'Palestra',      icon: Mic,     color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-500'   },
  painel:       { label: 'Painel',        icon: Users,   color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  panel:        { label: 'Painel',        icon: Users,   color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  oficina:      { label: 'Oficina',       icon: BookOpen,color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  workshop:     { label: 'Workshop',      icon: BookOpen,color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  minicurso:    { label: 'Minicurso',     icon: BookOpen,color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500'  },
  intervalo:    { label: 'Intervalo',     icon: Coffee,  color: 'bg-gray-100 text-gray-500 border-gray-200',     dot: 'bg-gray-300'   },
  break:        { label: 'Intervalo',     icon: Coffee,  color: 'bg-gray-100 text-gray-500 border-gray-200',     dot: 'bg-gray-300'   },
  abertura:     { label: 'Abertura',      icon: Play,    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  encerramento: { label: 'Encerramento',  icon: Flag,    color: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary'    },
  session:      { label: 'Sessão',        icon: Star,    color: 'bg-teal-100 text-teal-700 border-teal-200',     dot: 'bg-teal-500'   },
}

const DEFAULT_CONFIG = { label: 'Atividade', icon: Star, color: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' }

function formatDayLabel(day: string, index: number): string {
  try {
    const parsed = parseISO(day)
    if (isValid(parsed)) {
      return format(parsed, "EEE, d 'de' MMM", { locale: ptBR })
    }
  } catch { /* ignore */ }
  return `Dia ${index + 1}`
}

interface ScheduleSectionProps {
  schedule: ScheduleItem[]
  days: string[]
}

export function ScheduleSection({ schedule, days }: ScheduleSectionProps) {
  const [activeDay, setActiveDay] = useState(days[0] ?? '')

  const dayItems = schedule.filter((s) => s.day === activeDay)

  if (schedule.length === 0) return null

  return (
    <section aria-labelledby="programacao-heading">
      <h2 id="programacao-heading" className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Programação
      </h2>

      {days.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {days.map((day, idx) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors border capitalize',
                activeDay === day
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-muted'
              )}
            >
              {formatDayLabel(day, idx)}
            </button>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {dayItems.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            Programação em elaboração.
          </p>
        ) : (
          dayItems.map((item, idx) => {
            const config = TYPE_CONFIG[item.type] ?? DEFAULT_CONFIG
            const Icon = config.icon
            const isLast = idx === dayItems.length - 1

            return (
              <div
                key={`${item.day}-${item.time}-${idx}`}
                className={cn(
                  'flex gap-4 p-4',
                  !isLast && 'border-b border-border',
                  (item.type === 'intervalo') && 'bg-muted/40'
                )}
              >
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="text-sm font-mono font-semibold text-primary">{item.time}</span>
                </div>

                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn('w-3 h-3 rounded-full mt-1 flex-shrink-0', config.dot)} />
                  {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className={cn(
                      'font-medium text-sm leading-snug',
                      (item.type === 'intervalo') ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      {item.title}
                    </h3>
                    <span className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
                      config.color
                    )}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {item.speaker && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mic className="w-3 h-3" /> {item.speaker}
                      </span>
                    )}
                    {item.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
