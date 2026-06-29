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

  // light-mode.svg = logo branco (para fundo escuro)
  // dark-mode.svg  = logo colorido (para fundo claro)
  const mode = forceLight
    ? "light"
    : !mounted || resolvedTheme !== "dark"
    ? "dark"
    : "light";

  if (alwaysFull) {
    return (
      <Image
        src={`/eventus-logos/logo-eventus-name-${mode}-mode.svg`}
        alt="Eventus"
        width={height * 5}
        height={height}
        className={className}
        priority
        unoptimized
      />
    );
  }

  return (
    <>
      {/* Mobile: ícone sem nome */}
      <Image
        src={`/eventus-logos/logo-eventus-${mode}-mode.svg`}
        alt="Eventus"
        width={height}
        height={height}
        className={`block md:hidden ${className}`}
        priority
        unoptimized
      />
      {/* Desktop: logo com nome */}
      <Image
        src={`/eventus-logos/logo-eventus-name-${mode}-mode.svg`}
        alt="Eventus"
        width={height * 5}
        height={height}
        className={`hidden md:block ${className}`}
        priority
        unoptimized
      />
    </>
  );
}
