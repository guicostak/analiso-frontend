"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import logoImage from "@/src/assets/logos/logo.png";

const navLinks = [
  { label: "Início",        href: "/",                 activePath: "/",               color: "bg-brand" },
  { label: "Como funciona", href: "/como-funciona",    activePath: "/como-funciona",  color: "bg-brand" },
  { label: "Para quem é",   href: "/para-quem",        activePath: "/para-quem",      color: "bg-brand" },
  { label: "Blog",          href: "/blog",             activePath: "/blog",           color: "bg-brand" },
  { label: "FAQ",           href: "/faq",              activePath: "/faq",            color: "bg-brand" },
] as const;

interface LandingNavProps {
  /** Mostra o botão "Entrar" no canto direito. Padrão: true. */
  showAuthButton?: boolean;
}

export function LandingNav({ showAuthButton = true }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-sm">
      {/* ── Barra principal ─────────────────────────────────────────────── */}
      <div className="relative mx-auto flex max-w-[1430px] flex-wrap items-center justify-between px-8 pt-8 max-md:px-4 max-md:pt-5">

        {/* Logo */}
        <a href="/" className="order-1 flex shrink-0 items-center">
          <img
            src={logoImage.src}
            alt="Analiso"
            className="h-[34px] w-auto max-md:h-[26px]"
            draggable="false"
          />
        </a>

        {/* Nav links — desktop */}
        <nav className="absolute left-1/2 order-2 flex -translate-x-1/2 items-center gap-0.5 max-md:hidden">
          {navLinks.map(({ label, href, activePath, color }) => {
            const isActive = activePath !== null && pathname === activePath;
            return (
              <a
                key={label}
                href={href}
                className={`relative whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 transition-colors hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
                {isActive && color && (
                  <span className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full ${color}`} />
                )}
              </a>
            );
          })}
        </nav>

        {/* Ações — direita */}
        <div className="order-3 flex shrink-0 items-center gap-2">
          {showAuthButton && (
            <a
              href="/login"
              className="flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card px-4 py-3.5 text-sm font-semibold leading-5 text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:border-border-strong hover:ring-2 hover:ring-brand-surface hover:ring-offset-2 hover:ring-offset-card focus:outline-none focus:ring-2 focus:ring-brand-surface focus:ring-offset-2 focus:ring-offset-card active:scale-[0.98] max-md:h-8 max-md:px-3 max-md:py-1.5 max-md:text-xs"
            >
              Entrar
            </a>
          )}

          {/* Hambúrguer — mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="hidden h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] max-md:flex"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Menu mobile expandido ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="mx-auto w-full max-w-[1430px] border-t border-border px-4 py-2 md:hidden">
          <nav className="flex flex-col">
            {navLinks.map(({ label, href, activePath, color }) => {
              const isActive = activePath !== null && pathname === activePath;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-[10px] px-3 py-3 text-sm font-semibold hover:bg-hover ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {isActive && color && (
                    <span className={`h-4 w-0.5 rounded-full ${color}`} />
                  )}
                  {label}
                </a>
              );
            })}
            {!showAuthButton && (
              <a
                href="/"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-[10px] px-3 py-3 text-sm font-semibold text-brand hover:bg-brand-surface"
              >
                ← Voltar ao site
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default LandingNav;
