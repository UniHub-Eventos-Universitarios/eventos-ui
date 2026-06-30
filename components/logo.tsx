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

export function Logo({
  className = "",
  height = 36,
  forceLight = false,
  alwaysFull = false,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = forceLight || (mounted && resolvedTheme === "dark");

  // Ícones: light-mode = branco (fundo escuro), dark-mode = colorido (fundo claro)
  const iconSrc = isDark
    ? "/eventus-logos/logo-eventus-light-mode.svg"
    : "/eventus-logos/logo-eventus-dark-mode.svg";

  // Logos com nome: dark-l-mode = branco (fundo escuro), light-l-mode = colorido (fundo claro)
  const namedSrc = isDark
    ? "/eventus-logos/logo-eventus-name-dark-l-mode.svg"
    : "/eventus-logos/logo-eventus-name-light-l-mode.svg";

  // Todos os SVGs têm viewBox quadrado (375×383 ≈ 1:1)
  const size = height;

  if (alwaysFull) {
    return (
      <Image
        src={namedSrc}
        alt="Eventus"
        width={size}
        height={size}
        className={className}
        style={{ width: "auto", height: size }}
        priority
        unoptimized
      />
    );
  }

  return (
    <>
      {/* Mobile: ícone sem nome */}
      <Image
        src={iconSrc}
        alt="Eventus"
        width={size}
        height={size}
        className={`block md:hidden ${className}`}
        priority
        unoptimized
      />
      {/* Desktop: logo com nome */}
      <Image
        src={namedSrc}
        alt="Eventus"
        width={size}
        height={size}
        className={`hidden md:block ${className}`}
        style={{ width: "auto", height: size }}
        priority
        unoptimized
      />
    </>
  );
}
