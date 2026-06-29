"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Users, BookOpen } from "lucide-react";

const STATS = [
  { icon: CalendarDays, value: "50+", label: "Eventos por ano" },
  { icon: Users, value: "2k+", label: "Participantes" },
  { icon: BookOpen, value: "12", label: "Categorias" },
];

interface HeroSectionProps {
  readonly title?: React.ReactNode;
  readonly description?: string;
  readonly buttonText?: string;
  readonly buttonLink?: string;
  readonly imageUrl1?: string;
  readonly imageUrl2?: string;
}

export default function HeroSection({
  title = (
    <>
      Sua central de
      <br />
      <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
        eventos acadêmicos
      </span>
    </>
  ),
  description = "Encontre congressos, simpósios, workshops e palestras. Acesse programações completas e inscreva-se sem complicação.",
  buttonText = "Explorar eventos",
  buttonLink = "/eventos",
  imageUrl1 = "/eventus-logos/card-1.jpeg",
  imageUrl2 = "/eventus-logos/card-2.jpeg",
}: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Grid pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Texto ─────────────────────────────── */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Plataforma acadêmica oficial
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.1] tracking-tight text-foreground">
                {title}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                {buttonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 bg-muted text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-muted/80 transition-all hover:scale-[1.02] active:scale-[0.98] border border-border"
              >
                Criar conta
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
              className="flex flex-wrap gap-8 pt-2 border-t border-border"
            >
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Cards visuais ──────────────────────── */}
          <div className="relative h-[420px] md:h-[500px] hidden lg:flex items-center justify-center">
            {/* Card Traseiro */}
            <motion.div
              initial={{ opacity: 0, x: 160, y: -18, rotate: -2 }}
              animate={{ opacity: 1, x: 110, y: -18, rotate: -2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="absolute rounded-[24px] overflow-hidden shadow-2xl border border-border/40"
              style={{ width: 280, height: 400, zIndex: 1 }}
            >
              <div className="relative w-full h-full bg-gradient-to-br from-primary/20 via-blue-600/10 to-background">
                {imageUrl2 && (
                  <Image
                    src={imageUrl2}
                    alt=""
                    fill
                    className="object-cover opacity-50 dark:opacity-40 mix-blend-overlay"
                    unoptimized
                  />
                )}
              </div>
            </motion.div>

            {/* Card Frontal */}
            <motion.div
              initial={{ opacity: 0, x: -80, y: 0, rotate: 10 }}
              animate={{ opacity: 1, x: -55, y: 0, rotate: 10 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="absolute rounded-[24px] overflow-hidden shadow-2xl border border-border/30"
              style={{ width: 290, height: 420, zIndex: 2 }}
            >
              {imageUrl1 && (
                <Image
                  src={imageUrl1}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>

            {/* Badge flutuante */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              className="absolute bottom-8 right-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/90 backdrop-blur-sm shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground">Inscrições abertas</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
