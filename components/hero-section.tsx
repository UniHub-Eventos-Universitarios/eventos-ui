'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, MapPin, Users, Star } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

const FLOATING_CARDS = [
  {
    icon: Calendar,
    label: '24+ Eventos Ativos',
    sub: 'Congressos e simpósios',
    color: 'bg-blue-50 text-blue-600',
    delay: 0,
  },
  {
    icon: Users,
    label: '8.500+ Participantes',
    sub: 'Em toda a rede acadêmica',
    color: 'bg-violet-50 text-violet-600',
    delay: 0.15,
  },
  {
    icon: MapPin,
    label: '60+ Instituições',
    sub: 'Parceiras no país',
    color: 'bg-emerald-50 text-emerald-600',
    delay: 0.3,
  },
]

export function HeroSection() {
  return (
    <section className="relative bg-primary overflow-hidden pt-16">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left: text ─────────────────────────────────── */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 bg-accent/20 text-accent border border-accent/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            >
              <Star className="w-3.5 h-3.5" />
              Portal Oficial de Eventos Acadêmicos
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance"
            >
              Sua central de{' '}
              <span className="text-accent">eventos acadêmicos</span>{' '}
              em um só lugar
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-lg text-primary-foreground/75 leading-relaxed max-w-xl"
            >
              Encontre congressos, simpósios, workshops e palestras.
              Acesse programações completas, palestrantes e inscreva-se sem complicação.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/eventos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Explorar Eventos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/eventos?status=Inscri%C3%A7%C3%B5es+abertas"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-medium hover:bg-white/15 transition-colors"
              >
                Inscrições Abertas
              </Link>
            </motion.div>
          </div>

          {/* ── Right: floating cards ───────────────────────── */}
          <div className="flex-1 flex flex-col gap-4 w-full max-w-sm lg:max-w-xs xl:max-w-sm">
            {FLOATING_CARDS.map(({ icon: Icon, label, sub, color, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + delay, ease: 'easeOut' }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">{label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Decorative blob */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-2 rounded-2xl bg-white/5 border border-white/10 p-5 text-center"
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Próximo evento em</p>
              <p className="text-white text-3xl font-bold">3 dias</p>
              <p className="text-accent text-sm font-medium mt-1">Workshop de IA Aplicada</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative h-16">
        <svg
          viewBox="0 0 1440 64"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="oklch(0.98 0.004 250)" />
        </svg>
      </div>
    </section>
  )
}
