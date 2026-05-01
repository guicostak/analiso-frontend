"use client";

import { useEffect, useState } from "react";
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
  /** Força o modo sólido (sem dark-hero). Útil em páginas sem hero escuro. */
  forceSolid?: boolean;
}

// Altura aproximada do hero da waitlist — enquanto o scroll estiver abaixo disso,
// a navbar fica sobre o fundo escuro e usa texto branco.
const DARK_HERO_THRESHOLD = 120;

export function LandingNav({ showAuthButton = true, forceSolid = false }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onDarkHero, setOnDarkHero] = useState(!forceSolid);
  const pathname = usePathname();

  useEffect(() => {
    if (forceSolid) {
      setOnDarkHero(false);
      return;
    }
    const handleScroll = () => {
      setOnDarkHero(window.scrollY < DARK_HERO_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceSolid]);

  // Paletas condicionais: transparente sobre o hero escuro, card/blur depois.
  const headerBg = onDarkHero
    ? "bg-transparent"
    : "bg-card/90 backdrop-blur-sm";

  const linkInactive = onDarkHero
    ? "text-white/70 hover:text-white"
    : "text-muted-foreground hover:text-foreground";
  const linkActive = onDarkHero ? "text-white" : "text-foreground";

  const authButtonClass = onDarkHero
    ? "border-white/20 bg-white/5 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
    : "border-border bg-card text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:border-border-strong hover:ring-2 hover:ring-brand-surface hover:ring-offset-2 hover:ring-offset-card";

  const mobileBtnClass = onDarkHero
    ? "border-white/20 bg-white/5 text-white backdrop-blur-sm"
    : "border-border bg-card text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)]";

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${headerBg}`}
    >
      {/* ── Barra principal ─────────────────────────────────────────────── */}
      <div className="relative mx-auto flex h-20 max-w-[1430px] items-center justify-between px-8 max-md:h-16 max-md:px-4">

        {/* Logo */}
        <a href="/" className="order-1 flex shrink-0 items-center">
          <img
            src={logoImage.src}
            alt="Analiso"
            className={`h-[34px] w-auto max-md:h-[26px] transition ${
              onDarkHero ? "brightness-0 invert" : ""
            }`}
            draggable="false"
          />
        </a>

        {/* Nav links — desktop (vertically centered via top-1/2) */}
        <nav className="absolute left-1/2 top-1/2 order-2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 max-md:hidden">
          {navLinks.map(({ label, href, activePath, color }) => {
            const isActive = activePath !== null && pathname === activePath;
            return (
              <a
                key={label}
                href={href}
                className={`relative whitespace-nowrap rounded-[10px] px-3 py-3.5 text-sm font-semibold leading-5 transition-colors ${
                  isActive ? linkActive : linkInactive
                }`}
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
              className={`flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border px-4 py-3.5 text-sm font-semibold leading-5 transition-all duration-300 ease-out focus:outline-none active:scale-[0.98] max-md:h-8 max-md:px-3 max-md:py-1.5 max-md:text-xs ${authButtonClass}`}
            >
              Entrar
            </a>
          )}

          {/* Hambúrguer — mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={`hidden h-10 w-10 items-center justify-center rounded-[10px] border max-md:flex ${mobileBtnClass}`}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Menu mobile expandido ────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className={`mx-auto w-full max-w-[1430px] border-t px-4 py-2 md:hidden ${
            onDarkHero
              ? "border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md"
              : "border-border bg-card"
          }`}
        >
          <nav className="flex flex-col">
            {navLinks.map(({ label, href, activePath, color }) => {
              const isActive = activePath !== null && pathname === activePath;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-[10px] px-3 py-3 text-sm font-semibold ${
                    onDarkHero
                      ? `hover:bg-white/10 ${isActive ? "text-white" : "text-white/70"}`
                      : `hover:bg-hover ${isActive ? "text-foreground" : "text-muted-foreground"}`
                  }`}
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
