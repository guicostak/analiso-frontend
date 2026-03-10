import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { LogoMark } from "./LogoMark";

export function FooterSection() {
  return (
    <footer className="border-t border-[#E8EAED] bg-white px-5 pb-8 pt-12 md:px-10">
      <div className="mx-auto grid w-full max-w-[1454px] grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <LogoMark />
          <p className="mt-2 max-w-[220px] text-sm text-[#6B7280]">Inteligência financeira para investidores brasileiros.</p>
          <div className="mt-4 flex items-center gap-2">
            <Link
              to="/social/x"
              aria-label="Seguir no X"
              className="rounded-full border border-[#E5E7EB] p-2 text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              to="/social/linkedin"
              aria-label="Seguir no LinkedIn"
              className="rounded-full border border-[#E5E7EB] p-2 text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              to="/social/instagram"
              aria-label="Seguir no Instagram"
              className="rounded-full border border-[#E5E7EB] p-2 text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2"
            >
              <Instagram className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Produto</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#6B7280]">
            <a href="#funcionalidades" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Funcionalidades</a>
            <a href="#planos" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Preços</a>
            <Link to="/roadmap" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Roadmap</Link>
            <Link to="/changelog" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Changelog</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Empresa</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#6B7280]">
            <Link to="/about" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Sobre</Link>
            <Link to="/blog" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Blog</Link>
            <Link to="/careers" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Carreiras</Link>
            <Link to="/contact" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Contato</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Legal</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[#6B7280]">
            <Link to="/legal/terms" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Termos de uso</Link>
            <Link to="/legal/privacy" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Privacidade</Link>
            <Link to="/legal/cookies" className="rounded-sm hover:text-[#0E9384] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9384] focus-visible:ring-offset-2">Cookies</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[1454px] flex-col items-start justify-between gap-2 border-t border-[#F3F4F6] pt-5 text-xs text-[#6B7280] md:flex-row md:items-center">
        <p>© 2026 Analiso. Todos os direitos reservados.</p>
        <p>Dados: CVM / B3 / RI</p>
      </div>
    </footer>
  );
}



