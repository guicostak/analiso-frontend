"use client";

/**
 * AnalysisActionButtons
 *
 * Substitui os 4 botões placebo (Bookmark / Share / Compare / Alert) que antes
 * apareciam sem `onClick` na sidebar e na Company Card da tela /analysis.
 *
 * Cada botão existe por uma razão de negócio:
 *  - Bookmark: Endowment Effect — "essa empresa é minha".
 *  - Share: único retention loop orgânico da tela (viral copy de link).
 *  - Compare: leva a /comparar pré-preenchido, reaproveitando a infra do Compare.
 *  - Alert: transforma placebo em lead magnet — captura interesse mesmo
 *    antes da feature estar pronta (opt-in loop Zeigarnik).
 *
 * O componente é compartilhado entre sidebar (variant="compact") e
 * Company Card (variant="comfortable") para garantir comportamento idêntico.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Share2, GitCompareArrows, Bell, Check, X } from "lucide-react";
import { trackAnalysis } from "../services";

interface AnalysisActionButtonsProps {
  ticker: string;
  variant?: "compact" | "comfortable";
}

const FAV_KEY = (ticker: string) => `fav:${ticker}`;

/* ── Watchlist helpers (compartilhados com FavoriteButton de AnalysisShared) ── */

function readFav(ticker: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FAV_KEY(ticker)) === "1";
  } catch {
    return false;
  }
}

function writeFav(ticker: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(FAV_KEY(ticker), "1");
    else window.localStorage.removeItem(FAV_KEY(ticker));
  } catch {
    /* noop */
  }
}

/* ── Toast mínimo inline ──────────────────────────────────────────────────────
   Evita trazer toda uma lib de toast só pra 1 mensagem. Posicionado fixed
   bottom-right, auto-dismiss em 2.2s. */

function FloatingToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground shadow-lg"
      style={{ animation: "fade-in 180ms ease both" }}
      role="status"
    >
      <Check className="h-4 w-4 text-success-text" />
      {message}
    </div>
  );
}

/* ── Modal "Em breve" do Alert ────────────────────────────────────────────────
   Não temos backend de alerts ainda. Em vez de deixar o botão morto, capturamos
   a intenção — user escolhe o gatilho, disparamos telemetria com opt-in.
   Isso transforma um placebo em lead magnet. */

function AlertInterestModal({
  ticker,
  onClose,
}: {
  ticker: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const triggers = [
    { id: "price", label: "Mudança de preço > 5%" },
    { id: "score", label: "Score de qualquer pilar muda" },
    { id: "news", label: "Notícias relevantes" },
    { id: "earnings", label: "Novo resultado trimestral" },
  ];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    trackAnalysis("analysis_alert_interest", {
      ticker,
      triggers: Array.from(selected),
    });
    setDone(true);
    window.setTimeout(onClose, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      style={{ animation: "fade-in 180ms ease both" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        style={{ animation: "fade-in 220ms ease both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-success-surface">
              <Check className="h-5 w-5 text-success-text" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Anotado. Avisaremos quando os alertas chegarem.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Alertas de {ticker}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  A feature ainda não existe — mas se você escolher o que quer
                  monitorar, avisamos assim que ficar pronta.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {triggers.map((t) => {
                const active = selected.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[13px] transition ${
                      active
                        ? "border-brand bg-brand-surface text-brand-text"
                        : "border-border bg-card text-foreground hover:border-brand/60"
                    }`}
                  >
                    <span className="font-medium">{t.label}</span>
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-background"
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={submit}
              disabled={selected.size === 0}
              className="mt-5 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quero ser avisado
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────────── */

export function AnalysisActionButtons({
  ticker,
  variant = "comfortable",
}: AnalysisActionButtonsProps) {
  const router = useRouter();
  const [faved, setFaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Hydrate do localStorage no client (evita mismatch SSR)
  useEffect(() => {
    setFaved(readFav(ticker));
  }, [ticker]);

  const toggleFav = () => {
    const next = !faved;
    setFaved(next);
    writeFav(ticker, next);
    trackAnalysis("analysis_watchlist_toggled", { ticker, added: next });
    setToast(next ? "Adicionado à watchlist" : "Removido da watchlist");
  };

  const share = async () => {
    trackAnalysis("analysis_share_clicked", { ticker });
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://analiso.app/analysis/${ticker}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setToast("Link copiado");
        return;
      }
    } catch {
      /* fallthrough */
    }
    // Fallback: prompt nativo
    if (typeof window !== "undefined") window.prompt("Copie o link:", url);
  };

  const compare = () => {
    trackAnalysis("analysis_compare_clicked", { ticker });
    router.push(`/comparar?a=${encodeURIComponent(ticker)}`);
  };

  const openAlert = () => {
    setShowAlertModal(true);
  };

  const size = variant === "compact" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = variant === "compact" ? "w-4 h-4" : "w-[16px] h-[16px]";

  return (
    <>
      <div className={`flex items-center ${variant === "compact" ? "gap-0.5" : "gap-1"}`}>
        <button
          onClick={toggleFav}
          title={faved ? "Remover da watchlist" : "Adicionar à watchlist"}
          className={`flex items-center justify-center ${size} rounded-lg transition-colors ${
            faved
              ? "text-brand-text bg-brand-surface"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Bookmark className={iconSize} fill={faved ? "currentColor" : "none"} />
        </button>

        <button
          onClick={share}
          title="Compartilhar"
          className={`flex items-center justify-center ${size} rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`}
        >
          <Share2 className={iconSize} />
        </button>

        <button
          onClick={compare}
          title="Comparar com outra empresa"
          className={`flex items-center justify-center ${size} rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`}
        >
          <GitCompareArrows className={iconSize} />
        </button>

        <button
          onClick={openAlert}
          title="Alertas"
          className={`flex items-center justify-center ${size} rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors`}
        >
          <Bell className={iconSize} />
        </button>
      </div>

      {toast && <FloatingToast message={toast} onDone={() => setToast(null)} />}
      {showAlertModal && (
        <AlertInterestModal
          ticker={ticker}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </>
  );
}
