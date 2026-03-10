"use client";

import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Testimonial } from "../../data/landing";

interface TestimonialsClientProps {
  testimonials: Testimonial[];
}

const CARDS_PER_VIEW = 3;

export function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const maxStart = Math.max(0, testimonials.length - CARDS_PER_VIEW);
  const [startIndex, setStartIndex] = useState(0);

  const visibleCards = useMemo(
    () => testimonials.slice(startIndex, startIndex + CARDS_PER_VIEW),
    [startIndex, testimonials],
  );

  const canNavigate = testimonials.length > CARDS_PER_VIEW;

  const goPrev = () => {
    if (!canNavigate) return;
    setStartIndex((prev) => (prev === 0 ? maxStart : Math.max(0, prev - 1)));
  };

  const goNext = () => {
    if (!canNavigate) return;
    setStartIndex((prev) => (prev >= maxStart ? 0 : prev + 1));
  };

  return (
    <section className="bg-[#F4F6F9] px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1454px]">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-left" style={{ color: "#0E9384", fontSize: "12px", fontWeight: 500, lineHeight: "20px" }}>
              Depoimentos
            </p>
            <p
              className="mt-3"
              style={{
                fontSize: "38px",
                fontWeight: 600,
                color: "#101727",
                lineHeight: "100%",
                letterSpacing: "-0.02em",
                textWrap: "balance",
              }}
            >
              Investidores reais,
              <br />
              decisões mais claras.
            </p>
          </div>

          <div className="md:pt-1">
            <p style={{ color: "#7E7E7E", fontSize: "16px", fontWeight: 400, lineHeight: "130%", letterSpacing: "-1px" }}>
              Temos orgulho de ajudar investidores a entender empresas com mais clareza, tomar decisões mais conscientes e acompanhar mudanças relevantes com confiança todos os dias.
            </p>
            <p className="mt-3" style={{ color: "#413E52", fontSize: "16px", fontWeight: 600, lineHeight: "150%", letterSpacing: "-1px" }}>
              Veja pessoas que transformaram a forma de analisar empresas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {visibleCards.map((item) => (
            <article key={`${item.name}-${item.role}`} className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <UserCircle2 className="h-11 w-11 text-[#9CA3AF]" />
                  <p className="text-base font-semibold text-[#374151]">{item.name}</p>
                </div>
                <div className="flex items-center gap-0.5 text-[#0E9384]">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={`${item.name}-star-${idx}`} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="mt-4 text-base leading-[1.55] text-[#4B5563]">"{item.quote}"</p>
              <p className="mt-3 text-sm font-medium text-[#6B7280]">{item.role}</p>
            </article>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#CCFBF1] text-[#0E9384] transition hover:bg-[#99F6E4] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canNavigate}
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0E9384] text-white transition hover:bg-[#0B7F74] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canNavigate}
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/signup"
            className="inline-flex h-[57px] w-full max-w-[358px] items-center justify-center rounded-full bg-[#0E9384] px-8 text-[18px] font-semibold text-white shadow-[0_16px_30px_-18px_rgba(14,147,132,0.65)] transition hover:bg-[#0B7F74]"
          >
            Quero conhecer a Analiso
          </Link>
          <p className="mt-3 w-full text-center" style={{ color: "#737373", fontSize: "14px", fontWeight: 400 }}>
            Teste grátis sem instalar nada
          </p>
        </div>
      </div>
    </section>
  );
}

