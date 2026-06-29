import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, MapPin, Users, Clock, Building2,
  ArrowLeft, Mic, BookOpen, Tag,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getEventoBySlug } from '@/lib/api'
import { getStatusBadge, getCategoryBadge, getComputedStatus } from '@/lib/data'
import { cn } from '@/lib/utils'
import { ScheduleSection } from '@/components/schedule-section'
import { MapSection } from '@/components/map-section'
import ConfirmarPresencaButton from '@/components/confirmar-presenca-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const event = await getEventoBySlug(id)
  if (!event) notFound()

  const computed   = getComputedStatus(event)
  const statusBadge   = getStatusBadge(computed)
  const categoryClass = getCategoryBadge(event.category)

  const enrolled = event.enrolled ?? 0
  const capacity = event.capacity ?? 0
  const occupancy = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0
  const spotsLeft = capacity - enrolled
  const expired   = computed === 'encerrado' || computed === 'cancelado'

  const dateFormatted = format(parseISO(event.startDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const endDateFormatted = event.startDate !== event.endDate
    ? format(parseISO(event.endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  const days = [...new Set(event.schedule.map((s) => s.day))].sort()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-primary pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1.5 text-primary-foreground/70 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para eventos
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', categoryClass)}>
              {event.category}
            </span>
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusBadge.classes)}>
              {statusBadge.label}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white text-balance max-w-3xl">
            {event.title}
          </h1>
          <p className="text-primary-foreground/75 mt-3 text-lg max-w-2xl">
            {event.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="capitalize">{dateFormatted}{endDateFormatted ? ` a ${endDateFormatted}` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Clock className="w-4 h-4 text-accent" />
              <span>A partir das {event.startTime}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <MapPin className="w-4 h-4 text-accent" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Building2 className="w-4 h-4 text-accent" />
              <span>{event.organizerName}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            <div className="flex-1 min-w-0 space-y-8">

              <section aria-labelledby="sobre-heading">
                <h2 id="sobre-heading" className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Sobre o Evento
                </h2>
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-foreground/80 leading-relaxed">{event.longDescription}</p>
                  {event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                      <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                      {event.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <ScheduleSection schedule={event.schedule} days={days} />

              {event.speakers.length > 0 && (
                <section aria-labelledby="palestrantes-heading">
                  <h2 id="palestrantes-heading" className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Palestrantes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.id} className="bg-card border border-border rounded-xl p-5 flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary">
                            {speaker.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{speaker.name}</h3>
                          <p className="text-sm text-muted-foreground">{speaker.title}</p>
                          <p className="text-sm text-primary font-medium">{speaker.institution}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {event.workshops.length > 0 && (
                <section aria-labelledby="oficinas-heading">
                  <h2 id="oficinas-heading" className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Oficinas e Workshops
                  </h2>
                  <div className="flex flex-col gap-4">
                    {event.workshops.map((ws) => {
                      const wsEnrolled = ws.enrolled ?? 0
                      const wsCap = ws.capacity ?? 0
                      const pct = wsCap > 0 ? Math.round((wsEnrolled / wsCap) * 100) : 0
                      const spotsLeftWs = wsCap - wsEnrolled
                      return (
                        <div key={ws.id} className="bg-card border border-border rounded-xl p-5">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">{ws.title}</h3>
                              <p className="text-sm text-muted-foreground">{ws.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium text-foreground">{spotsLeftWs} vagas restantes</p>
                              <p className="text-xs text-muted-foreground">de {wsCap} total</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ws.startTime}–{ws.endTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ws.location}</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {ws.instructor}</span>
                          </div>
                          <div className="mt-3">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              <MapSection mapUrl={event.mapUrl} location={event.location} locationDetail={event.locationDetail} />
            </div>

            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">Gratuito</span>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', statusBadge.classes)}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {enrolled.toLocaleString('pt-BR')} inscritos
                      </span>
                      <span className="font-medium text-foreground">{occupancy}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all',
                          occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {spotsLeft > 0 ? `${spotsLeft.toLocaleString('pt-BR')} vagas disponíveis` : 'Esgotado'}
                    </p>
                  </div>

                  <ConfirmarPresencaButton
                    eventoId={Number(event.id)}
                    eventoSlug={event.slug}
                    expired={expired}
                    semVagas={spotsLeft === 0 && event.capacity > 0}
                  />
                </div>

                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">Informações</h3>
                  <div className="space-y-2">
                    <InfoRow icon={Calendar} label="Data" value={
                      endDateFormatted
                        ? `${format(parseISO(event.startDate), 'dd/MM/yyyy')} a ${format(parseISO(event.endDate), 'dd/MM/yyyy')}`
                        : format(parseISO(event.startDate), 'dd/MM/yyyy')
                    } />
                    <InfoRow icon={Clock}     label="Horário"      value={`${event.startTime} – ${event.endTime}`} />
                    <InfoRow icon={MapPin}    label="Local"        value={event.location} />
                    <InfoRow icon={Building2} label="Organizador"  value={event.organizerName} />
                    <InfoRow icon={Users}     label="Palestrantes" value={`${event.speakers.length} palestrante${event.speakers.length !== 1 ? 's' : ''}`} />
                    <InfoRow icon={BookOpen}  label="Workshops"    value={`${event.workshops.length} oficina${event.workshops.length !== 1 ? 's' : ''}`} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-xs text-muted-foreground block">{label}</span>
        <span className="text-sm text-foreground">{value}</span>
      </div>
    </div>
  )
}
