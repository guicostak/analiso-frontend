"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, CreditCard, Crown, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { API_BASE_URL } from "@/src/lib/api-base";

// Data de lançamento: 01 de maio de 2026, 09:00 (horário de Brasília, UTC-3)
const LAUNCH_DATE = new Date("2026-05-01T09:00:00-03:00");

// Vagas para "fundadores" (gera escassez real e ancoragem da progress bar)
const FOUNDER_SLOTS = 1000;

// Só revela número absoluto a partir desse limiar (anti-padrão: expor "12 inscritos" mata credibilidade)
const SOCIAL_PROOF_THRESHOLD = 50;

type Status = "idle" | "loading" | "success" | "error";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function computeRemaining(target: Date): Remaining {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: false };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-[0_0_24px_rgba(16,185,129,0.08)] min-w-[52px] sm:min-w-[64px]">
        <span className="block text-xl sm:text-2xl font-bold tabular-nums text-white">
          {pad(value)}
        </span>
      </div>
      <span className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50">
        {label}
      </span>
    </div>
  );
}

// Posições fixas para evitar hydration mismatch. 50 partículas com variação de
// tamanho, opacidade, velocidade e atraso.
interface Dot {
  l: number; // left %
  t: number; // top %
  s: number; // size px
  d: number; // delay s
  dur: number; // duration s
  o: number; // base opacity
  dx: number; // deslocamento X em px
}

const DOTS: Dot[] = [
  { l: 4, t: 12, s: 2, d: 0.0, dur: 12, o: 0.5, dx: 10 },
  { l: 9, t: 78, s: 3, d: 1.2, dur: 14, o: 0.35, dx: -8 },
  { l: 13, t: 34, s: 1.5, d: 0.6, dur: 10, o: 0.6, dx: 6 },
  { l: 17, t: 62, s: 2.5, d: 2.1, dur: 16, o: 0.25, dx: -12 },
  { l: 21, t: 18, s: 2, d: 3.4, dur: 11, o: 0.45, dx: 9 },
  { l: 26, t: 88, s: 1, d: 0.9, dur: 9, o: 0.7, dx: -5 },
  { l: 30, t: 45, s: 3.5, d: 4.2, dur: 18, o: 0.2, dx: 14 },
  { l: 34, t: 8, s: 2, d: 1.6, dur: 13, o: 0.4, dx: -7 },
  { l: 38, t: 71, s: 1.5, d: 0.3, dur: 10, o: 0.55, dx: 11 },
  { l: 42, t: 28, s: 2.5, d: 2.8, dur: 15, o: 0.3, dx: -9 },
  { l: 46, t: 56, s: 1, d: 3.9, dur: 8, o: 0.65, dx: 4 },
  { l: 49, t: 92, s: 3, d: 0.7, dur: 17, o: 0.25, dx: -13 },
  { l: 53, t: 15, s: 2, d: 2.3, dur: 12, o: 0.45, dx: 8 },
  { l: 57, t: 48, s: 1.5, d: 4.7, dur: 11, o: 0.55, dx: -6 },
  { l: 61, t: 82, s: 2.5, d: 1.1, dur: 14, o: 0.3, dx: 10 },
  { l: 65, t: 22, s: 1, d: 3.2, dur: 9, o: 0.7, dx: -4 },
  { l: 69, t: 65, s: 3, d: 0.4, dur: 16, o: 0.25, dx: 12 },
  { l: 73, t: 38, s: 2, d: 2.6, dur: 13, o: 0.4, dx: -8 },
  { l: 77, t: 95, s: 1.5, d: 4.1, dur: 10, o: 0.6, dx: 7 },
  { l: 81, t: 11, s: 2.5, d: 1.8, dur: 15, o: 0.3, dx: -11 },
  { l: 85, t: 54, s: 1, d: 3.7, dur: 8, o: 0.65, dx: 5 },
  { l: 89, t: 30, s: 3.5, d: 0.2, dur: 18, o: 0.2, dx: -14 },
  { l: 93, t: 74, s: 2, d: 2.9, dur: 12, o: 0.45, dx: 9 },
  { l: 96, t: 44, s: 1.5, d: 4.5, dur: 11, o: 0.5, dx: -7 },
  { l: 7, t: 52, s: 1, d: 1.4, dur: 9, o: 0.6, dx: 6 },
  { l: 15, t: 96, s: 2.5, d: 3.6, dur: 14, o: 0.3, dx: -10 },
  { l: 23, t: 68, s: 1.5, d: 0.8, dur: 11, o: 0.55, dx: 8 },
  { l: 28, t: 4, s: 2, d: 2.4, dur: 13, o: 0.4, dx: -6 },
  { l: 35, t: 82, s: 1, d: 4.0, dur: 9, o: 0.65, dx: 5 },
  { l: 41, t: 94, s: 3, d: 1.5, dur: 16, o: 0.22, dx: -12 },
  { l: 47, t: 6, s: 2, d: 3.1, dur: 12, o: 0.45, dx: 10 },
  { l: 54, t: 76, s: 1.5, d: 0.5, dur: 10, o: 0.55, dx: -7 },
  { l: 60, t: 3, s: 2.5, d: 2.7, dur: 15, o: 0.3, dx: 11 },
  { l: 66, t: 87, s: 1, d: 4.4, dur: 8, o: 0.7, dx: -4 },
  { l: 71, t: 53, s: 3, d: 1.9, dur: 17, o: 0.25, dx: 13 },
  { l: 78, t: 41, s: 2, d: 3.3, dur: 12, o: 0.4, dx: -9 },
  { l: 84, t: 85, s: 1.5, d: 0.1, dur: 10, o: 0.6, dx: 6 },
  { l: 90, t: 59, s: 2.5, d: 2.5, dur: 14, o: 0.3, dx: -10 },
  { l: 2, t: 38, s: 1, d: 3.8, dur: 9, o: 0.65, dx: 5 },
  { l: 11, t: 5, s: 2.5, d: 1.3, dur: 15, o: 0.3, dx: -11 },
  { l: 19, t: 49, s: 1, d: 4.6, dur: 8, o: 0.7, dx: 4 },
  { l: 25, t: 26, s: 3.5, d: 2.2, dur: 18, o: 0.2, dx: -14 },
  { l: 32, t: 61, s: 2, d: 0.6, dur: 13, o: 0.45, dx: 9 },
  { l: 43, t: 14, s: 1.5, d: 3.5, dur: 11, o: 0.55, dx: -7 },
  { l: 51, t: 34, s: 2.5, d: 1.0, dur: 14, o: 0.3, dx: 10 },
  { l: 58, t: 90, s: 1, d: 4.3, dur: 9, o: 0.65, dx: -5 },
  { l: 64, t: 9, s: 3, d: 1.7, dur: 16, o: 0.25, dx: 12 },
  { l: 75, t: 58, s: 2, d: 3.0, dur: 13, o: 0.4, dx: -8 },
  { l: 82, t: 23, s: 1.5, d: 0.3, dur: 10, o: 0.6, dx: 7 },
  { l: 95, t: 88, s: 2.5, d: 2.0, dur: 15, o: 0.3, dx: -11 },
];

function FloatingDots() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden motion-reduce:hidden sm:block"
    >
      <style>{`
        @keyframes waitlist-float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(var(--dx), -28px); }
        }
        @keyframes waitlist-twinkle {
          0%, 100% { opacity: var(--o); }
          50% { opacity: calc(var(--o) * 0.25); }
        }
      `}</style>
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white will-change-transform"
          style={
            {
              left: `${dot.l}%`,
              top: `${dot.t}%`,
              width: `${dot.s}px`,
              height: `${dot.s}px`,
              opacity: dot.o,
              "--o": dot.o,
              "--dx": `${dot.dx}px`,
              animation: `waitlist-float ${dot.dur}s ease-in-out ${dot.d}s infinite, waitlist-twinkle ${dot.dur * 0.7}s ease-in-out ${dot.d}s infinite`,
              boxShadow: `0 0 ${Math.max(dot.s * 2, 4)}px rgba(255,255,255,${dot.o * 0.6})`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

interface WaitlistHeroProps {
  /** ID do elemento âncora para o botão "conheça a ferramenta" rolar até. */
  exploreTargetId?: string;
}

export function WaitlistHero({
  exploreTargetId = "conheca-a-ferramenta",
}: WaitlistHeroProps) {
  const [remaining, setRemaining] = useState<Remaining>(() =>
    computeRemaining(LAUNCH_DATE),
  );
  const [count, setCount] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(computeRemaining(LAUNCH_DATE));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/waitlist/count`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (mountedRef.current && typeof data.count === "number") {
        setCount(data.count);
      }
    } catch {
      // silencioso — contador é informativo
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const launchDateLabel = useMemo(
    () =>
      LAUNCH_DATE.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = email.trim();
      if (!trimmed) {
        setStatus("error");
        setMessage("Informe um e-mail válido.");
        return;
      }
      setStatus("loading");
      setMessage(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/waitlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!res.ok) {
          throw new Error("request_failed");
        }
        const data = (await res.json()) as { count?: number };
        if (!mountedRef.current) return;
        if (typeof data.count === "number") setCount(data.count);
        setStatus("success");
        setMessage(
          "Vaga garantida! Em breve você recebe seu e-mail de confirmação.",
        );
        setEmail("");
      } catch {
        if (!mountedRef.current) return;
        setStatus("error");
        setMessage(
          "Não foi possível cadastrar agora. Tente novamente em instantes.",
        );
      }
    },
    [email],
  );

  const handleScrollToExplore = useCallback(() => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(exploreTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  }, [exploreTargetId]);

  const showAbsoluteCount =
    count !== null && count >= SOCIAL_PROOF_THRESHOLD;
  const slotsTaken = count ?? 0;
  const slotsLeft = Math.max(FOUNDER_SLOTS - slotsTaken, 0);
  const progressPct = Math.min(
    100,
    Math.round((slotsTaken / FOUNDER_SLOTS) * 100),
  );

  return (
    <section className="relative -mt-20 flex min-h-screen flex-col justify-center overflow-hidden border-b border-white/10 bg-[#0a0a0a] px-6 pt-24 pb-8 max-md:-mt-16 max-md:pt-20 sm:pt-28 sm:pb-10">
      {/* Bolinhas flutuantes */}
      <FloatingDots />

      {/* Vinheta radial sutil para profundidade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.04), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Kicker: natureza da página */}
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
          Lista de espera oficial
        </p>

        {/* Eyebrow / urgência + escassez */}
        <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-mint-300 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          IA chega em {launchDateLabel} • 1.000 vagas vitalícias
        </span>

        {/* Headline outcome-driven */}
        <h1 className="mt-4 text-[1.75rem] leading-tight sm:text-4xl font-bold tracking-tight text-white">
          Análise fundamentalista da B3{" "}
          <span className="text-mint-400">sem virar analista.</span>
        </h1>

        {/* Subheadline: hoje + lançamento, em uma linha */}
        <p className="mt-3 max-w-xl text-sm sm:text-base text-white/70 leading-relaxed">
          Use a plataforma hoje. Em{" "}
          <strong className="text-white">01/05/2026</strong>, a IA te guia em
          cada análise. Preço de fundador travado para sempre.
        </p>

        {/* Contador de tempo compacto */}
        <p className="mt-5 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-white/40">
          A IA começa a rodar em
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2 justify-items-center">
          <CountdownUnit value={remaining.days} label="dias" />
          <CountdownUnit value={remaining.hours} label="horas" />
          <CountdownUnit value={remaining.minutes} label="min" />
          <CountdownUnit value={remaining.seconds} label="seg" />
        </div>
        {remaining.done && (
          <p className="mt-3 text-xs font-semibold text-mint-400">
            Lançamento liberado! Confira seu e-mail.
          </p>
        )}

        {/* Âncora de preço — transforma "vitalício" abstrato em ganho concreto */}
        <div className="mt-5 inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs sm:text-sm backdrop-blur-sm">
          <span className="text-white/40 line-through tabular-nums">
            R$ 59,99
          </span>
          <span className="font-semibold text-white tabular-nums">
            R$ 29,99/mês
          </span>
          <span className="text-mint-300">para sempre</span>
        </div>

        {/* Form principal */}
        <form
          onSubmit={handleSubmit}
          className="mt-3 w-full max-w-md flex flex-col sm:flex-row gap-2"
        >
          <Input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="h-12 text-base bg-white/5 border-white/15 text-white placeholder:text-white/40 focus-visible:border-mint-400/60 focus-visible:ring-mint-400/20"
            aria-label="Seu e-mail"
          />
          <Button
            type="submit"
            variant="mint"
            disabled={status === "loading"}
            className="h-12 px-6 font-semibold"
          >
            {status === "loading"
              ? "Garantindo..."
              : "Travar R$ 29,99 vitalício"}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm ${
              status === "success" ? "text-mint-400" : "text-red-400"
            }`}
            role="status"
          >
            {message}
          </p>
        )}

        {/* Prova social + garantia — duas linhas respiradas */}
        <div className="mt-6 flex flex-col items-center gap-1.5 text-xs text-white/60">
          <span className="inline-flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-mint-400" />
            {showAbsoluteCount ? (
              <>
                <strong className="text-white tabular-nums">
                  {slotsTaken.toLocaleString("pt-BR")}
                </strong>{" "}
                fundadores garantidos •{" "}
                {slotsLeft.toLocaleString("pt-BR")} vagas restantes
              </>
            ) : (
              <>Só os 1.000 primeiros travam esse preço</>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-white/50" />
            Sem cartão agora • cobrança começa em junho de 2026
          </span>
        </div>
        {showAbsoluteCount && (
          <div className="mt-2 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-mint-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(progressPct, 4)}%` }}
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        )}

        {/* CTA secundário: explorar a landing — compacto */}
        <button
          type="button"
          onClick={handleScrollToExplore}
          className="group mt-6 inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
        >
          Conheça a ferramenta
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
