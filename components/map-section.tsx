'use client'

import { MapPin, ExternalLink, Navigation } from 'lucide-react'

interface MapSectionProps {
  mapUrl: string
  location: string
  locationDetail: string
}

export function MapSection({ mapUrl, location, locationDetail }: MapSectionProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ' ' + locationDetail)}`

  const embedUrl = mapUrl

  return (
    <section aria-labelledby="mapa-heading">
      <h2
        id="mapa-heading"
        className="text-xl font-bold text-foreground mb-3 flex items-center gap-2"
      >
        <MapPin className="w-5 h-5 text-primary" />
        Localização
      </h2>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Map embed */}
        <div className="relative w-full h-64 bg-muted">
          {embedUrl ? (
            <iframe
              title={`Mapa — ${location}`}
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-8 h-8 opacity-30" />
              <span className="text-sm">Mapa não disponível</span>
            </div>
          )}
        </div>

        {/* Address info */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground text-sm">{location}</p>
            <p className="text-sm text-muted-foreground">{locationDetail}</p>
          </div>

          <div className="flex gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Como chegar
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ampliar
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
