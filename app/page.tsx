import Link from 'next/link'
import { ArrowRight, Mic, BookOpen, Star, TrendingUp, Award, Users, Zap } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EventCard } from '@/components/event-card'
import HeroSection from '@/components/hero'
import { HomeSearch } from '@/components/home-search'
import { getEventos } from '@/lib/api'

const CATEGORIES = [
  { label: 'Congressos',   icon: Star,       color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
  { label: 'Simpósios',    icon: TrendingUp,  color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Workshops',    icon: BookOpen,    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  { label: 'Seminários',   icon: Mic,         color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  { label: 'Palestras',    icon: Users,       color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30' },
  { label: 'Conferências', icon: Award,       color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
]

export default async function HomePage() {
  const { data: apiEvents } = await getEventos({ status: 'ativo', perPage: '6' }).catch(() => ({
    data: [] as Awaited<ReturnType<typeof getEventos>>['data'],
    meta: { total: 0, page: 1, perPage: 6, totalPages: 1, hasPrev: false, hasNext: false },
  }))

  const featured = apiEvents.slice(0, 3)
  const upcoming = apiEvents.slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <HeroSection />

      {/* ── Busca rápida ──────────────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground mb-4 font-medium">
            Encontre seu próximo evento
          </p>
          <HomeSearch />
        </div>
      </section>

      {/* ── Eventos em Destaque ───────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-background py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Destaques</p>
                <h2 className="text-2xl font-bold text-foreground">Eventos em Destaque</h2>
                <p className="text-muted-foreground text-sm mt-1">Os eventos mais relevantes da temporada</p>
              </div>
              <Link
                href="/eventos"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/eventos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                Ver todos os eventos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Categorias ───────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Explorar</p>
            <h2 className="text-2xl font-bold text-foreground">Categorias de Eventos</h2>
            <p className="text-muted-foreground text-sm mt-1">Filtre pelo tipo de evento que você procura</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map(({ label, icon: Icon, color }) => (
              <Link
                key={label}
                href={`/eventos?categoria=${encodeURIComponent(label.slice(0, -1))}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-200 text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Próximos Eventos ─────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="bg-background py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Em breve</p>
                <h2 className="text-2xl font-bold text-foreground">Próximos Eventos</h2>
                <p className="text-muted-foreground text-sm mt-1">Não perca as próximas datas</p>
              </div>
              <Link
                href="/eventos"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 text-balance">
            Pronto para participar do próximo grande evento?
          </h2>
          <p className="text-white/70 mb-8 text-base">
            Explore a programação completa, conheça os palestrantes e garanta sua vaga agora.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-semibold text-sm hover:bg-white/90 transition-all hover:scale-[1.02]"
            >
              Ver Todos os Eventos
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all hover:scale-[1.02] backdrop-blur-sm"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
