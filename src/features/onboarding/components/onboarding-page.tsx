"use client";

import React, { useEffect, useRef, useState } from "react";

import { useOnboarding } from "../hooks/useOnboarding";
import {
  intentTileItems,
  valueItems,
  popularTickers,
  companyLogoByTicker,
  portaOnboardingSrc,
  stepMeta,
  TOTAL_STEPS,
} from "../services";
import type { StartIntent } from "../interfaces";

// ─── Sub-componentes visuais ──────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const percent = Math.min(100, Math.max(0, (step / TOTAL_STEPS) * 100));
  return (
    <div className="w-48 h-1 rounded-full bg-[#E4E7EC] overflow-hidden">
      <div className="h-full bg-[#0E9384] transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function Icon3D({ name }: { name: string }) {
  const accents: Record<string, React.ReactElement> = {
    b3:       <rect x="20" y="22" width="24" height="16" rx="3" fill="#0E9384" opacity="0.25" />,
    cap:      <path d="M20 28l12-6 12 6-12 6-12-6z" fill="#0E9384" opacity="0.25" />,
    magnifier: (
      <>
        <circle cx="28" cy="30" r="6" fill="#0E9384" opacity="0.25" />
        <rect x="34" y="34" width="10" height="3" rx="1.5" fill="#0E9384" opacity="0.35" />
      </>
    ),
    dash:      <rect x="22" y="24" width="20" height="14" rx="2" fill="#0E9384" opacity="0.25" />,
    bookmark:  <path d="M24 22h16v20l-8-5-8 5V22z" fill="#0E9384" opacity="0.25" />,
    bellpulse: (
      <>
        <path d="M24 38h16l-2-3v-5a6 6 0 0 0-12 0v5l-2 3z" fill="#0E9384" opacity="0.25" />
        <circle cx="44" cy="22" r="3" fill="#0E9384" opacity="0.35" />
      </>
    ),
    factory:  <rect x="20" y="24" width="24" height="16" rx="2" fill="#0E9384" opacity="0.25" />,
    bank:     <path d="M20 30h24v10H20z" fill="#0E9384" opacity="0.25" />,
    oil:      <ellipse cx="32" cy="34" rx="8" ry="10" fill="#0E9384" opacity="0.25" />,
    mine:     <path d="M22 38l10-12 10 12H22z" fill="#0E9384" opacity="0.25" />,
    store:    <rect x="20" y="26" width="24" height="14" rx="2" fill="#0E9384" opacity="0.25" />,
    car:      <rect x="20" y="30" width="24" height="8" rx="3" fill="#0E9384" opacity="0.25" />,
    pharmacy: <rect x="24" y="26" width="16" height="16" rx="3" fill="#0E9384" opacity="0.25" />,
  };

  return (
    <div className="w-12 h-12 rounded-xl bg-white border border-[#EAECF0] shadow-sm flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-8 h-8" aria-hidden="true">
        <path
          d="M32 6l22 12v28L32 58 10 46V18L32 6z"
          fill="#E8F6F4"
          stroke="#0E9384"
          strokeWidth="2"
        />
        <path d="M32 6v52" stroke="#0E9384" strokeWidth="2" strokeOpacity="0.35" />
        {accents[name]}
      </svg>
    </div>
  );
}

function TileGrid({
  items,
  columns = 2,
  selectedId,
  onSelect,
  lockedIds = [],
}: {
  items: Array<{
    id: string;
    title: string;
    helper?: string;
    icon: string;
    imageSrc?: string;
    imageAlt?: string;
    badge?: string;
  }>;
  columns?: 1 | 2;
  selectedId: string | null;
  onSelect: (id: string) => void;
  lockedIds?: string[];
}) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const idx = items.findIndex((item) => item.id === selectedId);
    setFocusedIndex(idx >= 0 ? idx : 0);
  }, [items, selectedId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const colCount = columns;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = Math.min(items.length - 1, index + 1);
    if (event.key === "ArrowLeft")  nextIndex = Math.max(0, index - 1);
    if (event.key === "ArrowDown")  nextIndex = Math.min(items.length - 1, index + colCount);
    if (event.key === "ArrowUp")    nextIndex = Math.max(0, index - colCount);

    if (nextIndex !== index) {
      event.preventDefault();
      itemRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(items[index].id);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : ""} gap-4`}>
      {items.map((item, index) => {
        const isSelected = item.id === selectedId;
        const isLocked   = lockedIds.includes(item.id);
        return (
          <button
            key={item.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            type="button"
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            aria-pressed={isSelected}
            aria-disabled={isLocked}
            className={`text-center rounded-2xl border p-4 transition-all shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0E9384]/40 ${
              isSelected ? "border-[#0E9384] bg-[#0E9384]/5" : "border-[#EAECF0] hover:border-[#D0D5DD]"
            } ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"}`}
          >
            <div className="relative flex items-center justify-center">
              {item.imageSrc ? (
                <div className="w-24 h-24 flex items-center justify-center">
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt ?? item.title}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <Icon3D name={item.icon} />
              )}
              {item.badge && (
                <span className="absolute -top-2 right-0 text-[10px] text-[#0E9384] bg-[#0E9384]/10 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold">{item.title}</p>
            {item.helper && <p className="mt-1 text-xs text-[#475467]">{item.helper}</p>}
          </button>
        );
      })}
    </div>
  );
}

function SecondaryButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer px-4 py-2 rounded-xl border border-[#D0D5DD] text-sm text-[#344054] hover:border-[#98A2B3] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#0E9384] text-white text-sm font-semibold hover:bg-[#0B7F74] disabled:bg-[#D0D5DD] disabled:text-[#98A2B3] disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function OnboardingPage() {
  const {
    step,
    draft,
    search,
    completing,
    completeError,
    filteredSuggestions,
    canContinue,
    goNext,
    goBack,
    setStartIntent,
    addTicker,
    removeTicker,
    setSearch,
    handleSearchKeyDown,
    handleComplete,
  } = useOnboarding();

  const meta = stepMeta[step - 1];

  const renderContent = () => {
    if (step === 1) {
      return (
        <TileGrid
          columns={2}
          items={intentTileItems}
          selectedId={draft.startIntent}
          onSelect={(id) => setStartIntent(id as StartIntent)}
        />
      );
    }

    if (step === 2) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {valueItems.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-4 md:p-5"
            >
              <div className="flex items-center gap-3">
                {item.imageSrc ? (
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="w-28 h-28 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <Icon3D name={item.icon} />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#0B1220]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#475467]">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar por nome ou ticker (ex: WEGE3)"
            className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9384]/30"
          />

          <div className="mt-4">
            <p className="text-xs text-[#667085] mb-2">Sugestões populares</p>
            <div className="flex flex-wrap gap-2">
              {popularTickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => addTicker(ticker, "chip")}
                  className="cursor-pointer px-3 py-1 rounded-full border border-[#EAECF0] text-xs text-[#475467] hover:border-[#D0D5DD]"
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-[#667085] mb-2">
              Selecionadas ({draft.watchlistTickers.length}/3)
            </p>
            <div className="flex flex-wrap gap-2">
              {draft.watchlistTickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => removeTicker(ticker)}
                  className="px-3 py-1 rounded-full border border-[#0E9384]/30 text-xs text-[#0E9384] hover:border-[#0E9384] flex items-center gap-2"
                >
                  {ticker}
                  <span className="text-[10px]">×</span>
                </button>
              ))}
            </div>
            {draft.watchlistTickers.length >= 3 && (
              <p className="mt-2 text-xs text-[#475467]">
                Você já garantiu seu início (3). Pode adicionar mais agora ou editar depois.
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuggestions.map((item) => (
              <button
                key={item.ticker}
                type="button"
                onClick={() => addTicker(item.ticker, "grid")}
                className={`cursor-pointer text-left rounded-2xl border p-4 transition-all shadow-sm bg-white hover:border-[#D0D5DD] ${
                  draft.watchlistTickers.includes(item.ticker)
                    ? "border-[#0E9384] bg-[#0E9384]/5"
                    : "border-[#EAECF0]"
                }`}
              >
                <div className="flex items-start justify-between">
                  {companyLogoByTicker[item.ticker] ? (
                    <div className="h-12 w-12 overflow-hidden rounded-lg">
                      <img
                        src={companyLogoByTicker[item.ticker]}
                        alt={`Logo de ${item.name}`}
                        className="h-full w-full rounded-lg object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <Icon3D name={item.icon} />
                  )}
                  {item.tag && (
                    <span className="text-[10px] text-[#667085] border border-[#EAECF0] rounded-full px-2 py-0.5">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold">
                  {item.name} ({item.ticker})
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-5 text-left">
        <p className="text-sm text-[#475467]">
          Tudo pronto para começar com seu dashboard já útil desde a primeira sessão.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#344054]">
          <li>• Sua base inicial está montada com empresas selecionadas.</li>
          <li>• Você poderá ajustar preferências e alertas no momento certo, dentro do produto.</li>
          <li>• Também poderá editar suas empresas quando quiser.</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1220]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <ProgressBar step={step} />
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0E9384]/10 border border-[#0E9384]/30 flex items-center justify-center text-sm font-semibold text-[#0E9384]">
                A
              </div>
              <span className="text-sm font-semibold tracking-wide">Analiso</span>
            </div>
          </div>
          <div className="w-48" />
        </div>

        <div className="mt-10 flex justify-center">
          <div className="w-full max-w-[720px] bg-white border border-[#EAECF0] rounded-3xl shadow-sm p-6 md:p-8">
            <div className="text-center">
              {step === 4 && (
                <img
                  src={portaOnboardingSrc}
                  alt="Porta de entrada no produto"
                  className="mx-auto mb-3 h-30 w-30 object-contain"
                  loading="lazy"
                />
              )}
              <p className="text-xs text-[#667085]">Etapa {step} de {TOTAL_STEPS}</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold">{meta.title}</h1>
              <p className="mt-2 text-sm text-[#475467]">{meta.subtitle}</p>
            </div>

            <div className="mt-8">{renderContent()}</div>

            {completeError && (
              <p className="mt-4 text-sm text-red-600 text-center">{completeError}</p>
            )}

            <div className="mt-8 flex items-center justify-between">
              {step === 1 ? (
                <div />
              ) : (
                <SecondaryButton onClick={goBack} disabled={completing}>
                  &larr; Voltar
                </SecondaryButton>
              )}
              {step < TOTAL_STEPS ? (
                <PrimaryButton onClick={goNext} disabled={!canContinue}>
                  Continuar &rarr;
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  onClick={handleComplete}
                  disabled={!canContinue || completing}
                >
                  {completing ? "Salvando..." : "Ir para meu dashboard"}
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
