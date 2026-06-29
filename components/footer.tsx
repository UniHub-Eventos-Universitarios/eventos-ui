import Link from "next/link";
import { Logo } from "@/components/logo";
import { GitBranch, Mail } from "lucide-react";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Todos os eventos" },
  { href: "/login", label: "Entrar" },
];

const CATEGORIES = [
  "Congresso", "Simpósio", "Oficina",
  "Palestra", "Seminário", "Semana Acadêmica",
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0A0A0A] text-[#A1A1AA]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 inline-block">
              <Logo height={40} forceLight />
            </Link>
            <p className="text-sm leading-relaxed text-[#71717A] max-w-xs">
              Plataforma oficial de eventos acadêmicos. Congressos, simpósios, workshops e palestras — tudo em um só lugar.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:eventos@universidade.edu.br"
                className="flex items-center justify-center w-8 h-8 rounded-md border border-[#27272A] text-[#71717A] hover:text-white hover:border-[#3F3F46] transition-colors"
                aria-label="E-mail"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-md border border-[#27272A] text-[#71717A] hover:text-white hover:border-[#3F3F46] transition-colors"
                aria-label="GitHub"
              >
                <GitBranch className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
              Navegação
            </h3>
            <ul className="space-y-3 text-sm">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-underline hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#52525B]">
              Categorias
            </h3>
            <ul className="space-y-3 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/eventos?categoria=${encodeURIComponent(cat)}`}
                    className="link-underline hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#18181B] pt-8 sm:flex-row">
          <p className="text-xs text-[#52525B]">
            &copy; {new Date().getFullYear()} Eventus — Central de Eventos Universitários.
          </p>
          <p className="text-xs text-[#52525B]">
            Desenvolvido pela equipe acadêmica
          </p>
        </div>
      </div>
    </footer>
  );
}
