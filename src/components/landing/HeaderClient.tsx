"use client";

import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavLink } from "../../data/landing";
import { LogoMark } from "./LogoMark";

interface HeaderClientProps {
  navLinks: NavLink[];
}

export function HeaderClient({ navLinks }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      buttonRef.current?.focus();
      return;
    }

    document.body.style.overflow = "hidden";
    const firstLink = menuRef.current?.querySelector("a,button") as HTMLElement | null;
    firstLink?.focus();

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="hero-header">
      <div className="hidden h-16 w-full items-center justify-between md:flex">
        <LogoMark />

        <nav className="flex items-center gap-8 text-[15px] font-medium text-[#111827]" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a
              key={`nav-${link.label}`}
              href={link.href}
              className="rounded-sm transition hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-[#E5E7EB] px-5 py-2 text-sm text-[#111827] transition hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#0E9384] px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#0B7F74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          >
            Começar grátis
          </Link>
        </div>
      </div>

      <div className="flex h-16 w-full items-center justify-between px-4 md:hidden">
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Abrir ou fechar menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <LogoMark />

        <Link
          to="/signup"
          className="rounded-full bg-[#0E9384] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0B7F74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
        >
          Começar grátis
        </Link>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-nav-menu" ref={menuRef} className="border-t border-[#E8EAED] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-[#111827]" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <a
                key={`mobile-nav-${link.label}`}
                href={link.href}
                onClick={closeMenu}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-sm text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
            >
              Entrar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}




