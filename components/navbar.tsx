"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, CalendarCheck, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Eventos" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href) && !pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-background/0 backdrop-blur-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Logo height={32} />
          </Link>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {!loading && (
              user ? (
                <>
                  <Link
                    href="/meus-eventos"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      pathname.startsWith("/meus-eventos")
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Meus Eventos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        pathname.startsWith("/admin")
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}

                  {/* User menu */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-sm">
                    <span className="font-medium text-foreground max-w-[96px] truncate">
                      {user.nome.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                    aria-label="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Criar conta
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-expanded={open}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16" />

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 md:hidden transition-all duration-200 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="mx-4 mt-2 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <nav className="flex flex-col p-2 gap-0.5" aria-label="Navegação mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-1 h-px bg-border" />

            {!loading && (
              user ? (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground">
                    Logado como <span className="font-semibold text-foreground">{user.nome.split(" ")[0]}</span>
                  </div>
                  <Link
                    href="/meus-eventos"
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname.startsWith("/meus-eventos")
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" /> Meus Eventos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        pathname.startsWith("/admin")
                          ? "text-foreground bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="flex items-center justify-center mx-2 mb-1 px-4 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Criar conta
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
