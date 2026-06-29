import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EventCard } from '@/components/event-card'
import { EventFilters } from '@/components/event-filters'
import { MiniCalendar } from '@/components/mini-calendar'
import { Pagination } from '@/components/pagination'
import { getEventos } from '@/lib/api'
import { Search } from 'lucide-react'

const PAGE_SIZE = 6

interface SearchParams {
  search?: string
  categoria?: string
  category?: string
  status?: string
  sort?: string
  page?: string
}

function mapSortParam(sort?: string): Record<string, string> {
  switch (sort) {
    case 'date-desc':       return { sort: 'data_inicio', order: 'DESC' }
    case 'title-asc':       return { sort: 'titulo',      order: 'ASC'  }
    case 'title-desc':      return { sort: 'titulo',      order: 'DESC' }
    case 'registered-desc': return { sort: 'data_inicio', order: 'DESC' }
    default:                return { sort: 'data_inicio', order: 'ASC'  }
  }
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<Readonly<SearchParams>>
}) {
  const params = await searchParams

  const apiParams: Record<string, string> = {
    perPage: String(PAGE_SIZE),
    page: params.page ?? '1',
    ...mapSortParam(params.sort),
  }
  if (params.search)   apiParams.busca     = params.search
  if (params.categoria || params.category) {
    apiParams.categoria = params.categoria ?? params.category ?? ''
  }
  if (params.status)   apiParams.status    = params.status

  const { data: events, meta } = await getEventos(apiParams).catch(() => ({
    data: [] as Awaited<ReturnType<typeof getEventos>>['data'],
    meta: { total: 0, page: 1, perPage: PAGE_SIZE, totalPages: 0, hasPrev: false, hasNext: false },
  }))

  const currentPage = meta.page
  const totalItems  = meta.total
  const totalPages  = meta.totalPages
  const hasFilters  = params.search || params.categoria || params.category || params.status

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Explorar</p>
          <h1 className="text-3xl font-bold text-foreground">Eventos Acadêmicos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {totalItems} evento{totalItems !== 1 ? 's' : ''}{' '}
            {hasFilters ? 'com os filtros aplicados' : 'disponíveis'}
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="w-full lg:w-60 flex-shrink-0">
              <Suspense fallback={<div className="h-96 rounded-xl bg-muted animate-pulse" />}>
                <EventFilters />
              </Suspense>
              <div className="mt-5">
                <Suspense>
                  <MiniCalendar events={events} />
                </Suspense>
              </div>
            </aside>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              {/* Barra de controles */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Página{' '}
                  <span className="font-medium text-foreground">{currentPage}</span>
                  {' '}de{' '}
                  <span className="font-medium text-foreground">{Math.max(totalPages, 1)}</span>
                </p>
              </div>

              {/* Grid de eventos */}
              {events.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  <Suspense>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      pageSize={PAGE_SIZE}
                    />
                  </Suspense>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-5">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Nenhum evento encontrado
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Tente ajustar os filtros ou limpar a busca.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
