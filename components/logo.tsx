"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  height?: number;
  /** Força o logo branco (para fundos sempre escuros, ex: footer) */
  forceLight?: boolean;
  /** Sempre mostra a versão com nome, independente do tamanho de tela */
  alwaysFull?: boolean;
}

export function Logo({ className = "", height = 36, forceLight = false, alwaysFull = false }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Ícones (dark-mode.svg = colorido para fundo claro, light-mode.svg = branco para fundo escuro)
  const iconMode = forceLight || (mounted && resolvedTheme === "dark") ? "light" : "dark";

  // Logos com nome (dark-l-mode = branco para fundo escuro, light-l-mode = colorido para fundo claro)
  const namedSrc = forceLight || (mounted && resolvedTheme === "dark")
    ? "/eventus-logos/logo-eventus-name-dark-l-mode.svg"
    : "/eventus-logos/logo-eventus-name-light-l-mode.svg";

  // Todos os SVGs têm viewBox quadrado (375×383 ≈ 1:1)
  const w = Math.round(height * (375.12 / 383.04));

  if (alwaysFull) {
    return (
      <Image
        src={namedSrc}
        alt="Eventus"
        width={w}
        height={height}
        className={className}
        priority
        unoptimized
        style={{ width: "auto", height: height }}
      />
    );
  }

  return (
    <>
      {/* Mobile: ícone sem nome */}
      <Image
        src={`/eventus-logos/logo-eventus-${iconMode}-mode.svg`}
        alt="Eventus"
        width={height}
        height={height}
        className={`block md:hidden ${className}`}
        priority
        unoptimized
      />
      {/* Desktop: logo com nome */}
      <Image
        src={namedSrc}
        alt="Eventus"
        width={w}
        height={height}
        className={`hidden md:block ${className}`}
        priority
        unoptimized
        style={{ width: "auto", height: height }}
      />
    </>
  );
}
