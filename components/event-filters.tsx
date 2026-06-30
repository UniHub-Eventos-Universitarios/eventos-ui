'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventCategory, EventStatus } from '@/lib/data'

const CATEGORIES: EventCategory[] = [
  'Congresso', 'Simpósio', 'Oficina', 'Seminário', 'Palestra', 'Semana Acadêmica', 'Feira',
]

const STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'ativo',     label: 'Ativo' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const SORT_OPTIONS = [
  { value: 'date-asc',        label: 'Data: Mais próxima' },
  { value: 'date-desc',       label: 'Data: Mais distante' },
  { value: 'title-asc',       label: 'Título: A–Z' },
  { value: 'title-desc',      label: 'Título: Z–A' },
  { value: 'registered-desc', label: 'Mais inscritos' },
]

export function EventFilters() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const search   = searchParams.get('search')   ?? ''
  const category = searchParams.get('category') ?? ''
  const status   = searchParams.get('status')   ?? ''
  const sort     = searchParams.get('sort')     ?? 'date-asc'

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else       params.delete(key)
      params.delete('page')
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams],
  )

  const clearAll = () => startTransition(() => router.replace(pathname, { scroll: false }))

  const hasFilters = search || category || status || sort !== 'date-asc'

  return (
    <aside className="w-full space-y-4">

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar eventos…"
          defaultValue={search}
          onChange={(e) => updateParam('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          aria-label="Buscar eventos"
        />
        {search && (
          <button
            onClick={() => updateParam('search', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Painel de filtros */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            Filtros
            {hasFilters && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {[search, category, status, sort !== 'date-asc' ? '1' : ''].filter(Boolean).length}
              </span>
            )}
          </span>
          {filtersOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {filtersOpen && (
          <div className="border-t border-border p-4 space-y-5">

            {/* Categoria */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                Categoria
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => updateParam('category', '')}
                  className={cn(
                    'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    !category
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  Todas
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateParam('category', category === cat ? '' : cat)}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      category === cat
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                Status
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => updateParam('status', '')}
                  className={cn(
                    'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    !status
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  Todos
                </button>
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateParam('status', status === s.value ? '' : s.value)}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      status === s.value
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                Ordenar por
              </p>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all pr-8 cursor-pointer"
                  aria-label="Ordenar eventos"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Limpar */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {isPending && (
        <p className="text-xs text-muted-foreground animate-pulse">Atualizando…</p>
      )}
    </aside>
  )
}
