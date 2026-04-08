"use client";

/**
 * NotificationsPage
 *
 * Tela "Todas as notificações" — acessada via dropdown do sino ou link do
 * dashboard. Lista todas as notificações do usuário com filtros por categoria:
 * Notícias, Contexto do mercado, Movimentações do mercado.
 */

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Globe,
  Newspaper,
  TrendingUp,
} from "lucide-react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { AppTopBar } from "@/src/components/layout/AppTopBar";
import { MainContent } from "@/src/components/layout/MainContent";
import { LoadingState } from "@/src/components/feedback";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification, NotificationCategory } from "../interfaces";

// ─── Filtros ─────────────────────────────────────────────────────────────────

type FilterKey = "all" | NotificationCategory;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all",                   label: "Todas" },
  { key: "noticias",              label: "Notícias" },
  { key: "contexto_mercado",      label: "Contexto do mercado" },
  { key: "movimentacoes_mercado", label: "Movimentações do mercado" },
];

// ─── Visual por categoria (mesmo do dropdown) ────────────────────────────────

type CategoryVisual = {
  Icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  label: string;
};

const CATEGORY_CONFIG: Record<NotificationCategory, CategoryVisual> = {
  noticias: {
    Icon: Newspaper,
    iconClass: "text-brand",
    bgClass: "bg-brand-surface",
    label: "Notícias",
  },
  contexto_mercado: {
    Icon: Globe,
    iconClass: "text-warning-text",
    bgClass: "bg-warning-surface",
    label: "Contexto do mercado",
  },
  movimentacoes_mercado: {
    Icon: TrendingUp,
    iconClass: "text-danger-text",
    bgClass: "bg-danger-surface",
    label: "Movimentações do mercado",
  },
};

const FALLBACK_VISUAL: CategoryVisual = {
  Icon:      Bell,
  iconClass: "text-muted-foreground",
  bgClass:   "bg-muted",
  label:     "Outras",
};

function getVisual(category: NotificationCategory | null): CategoryVisual {
  return category ? CATEGORY_CONFIG[category] : FALLBACK_VISUAL;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "agora";
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ─── Item ────────────────────────────────────────────────────────────────────

function NotificationRow({
  item,
  onRead,
}: {
  item: Notification;
  onRead: (id: number) => void;
}) {
  const visual = getVisual(item.category);
  const { Icon, iconClass, bgClass, label } = visual;

  return (
    <button
      type="button"
      onClick={() => { if (!item.read) onRead(item.id); }}
      className={`flex w-full items-start gap-4 rounded-[18px] border border-border bg-card px-5 py-4 text-left shadow-[0_1px_2px_rgba(15,23,40,0.04)] transition hover:border-brand/30 hover:bg-hover dark:shadow-none ${
        item.read ? "opacity-70" : ""
      }`}
    >
      {/* Ícone da categoria */}
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className={`h-[18px] w-[18px] ${iconClass}`} />
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[14px] font-semibold ${item.read ? "text-muted-foreground" : "text-foreground"}`}>
              {item.title}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {relativeTime(item.timestamp)}
          </span>
        </div>

        <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
          {item.body}
        </p>

        {item.ticker && (
          <span className="mt-2.5 inline-block rounded-full border border-brand/20 bg-brand-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand">
            {item.ticker}
          </span>
        )}
      </div>

      {/* Ponto de não-lido */}
      {!item.read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
      )}
    </button>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { items, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((n) => n.category === activeFilter);
  }, [items, activeFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar currentPage="" />
      <AppTopBar />

      <MainContent className="relative overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[14%] top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.09)_0%,rgba(91,141,239,0)_72%)]" />
          <div className="absolute right-[10%] top-44 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(18,165,148,0.08)_0%,rgba(18,165,148,0)_72%)]" />
        </div>

        <div className="relative px-7 pb-10 pt-5">
          <div className="mx-auto max-w-[960px]">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[26px] font-semibold leading-[32px] tracking-[-0.02em] text-foreground">
                  Todas as notificações
                </h1>
                <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
                  {isLoading
                    ? "Carregando seu histórico…"
                    : `${items.length} no histórico · ${unreadCount} não lido(s)`}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition hover:border-brand/30 hover:bg-brand-surface hover:text-brand"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Filtros (chips) */}
            <div className="mt-6 flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFilter(f.key)}
                    className={`rounded-full border px-4 py-1.5 text-[12px] font-medium transition ${
                      active
                        ? "border-brand/30 bg-brand-surface text-brand"
                        : "border-border bg-muted text-muted-foreground hover:bg-card"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Lista */}
            <div className="mt-6">
              {isLoading ? (
                <div className="rounded-[24px] border border-border bg-card">
                  <LoadingState label="Carregando seu histórico…" inline />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center rounded-[24px] border border-border bg-card px-7 py-16 text-center">
                  <Bell className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-[15px] font-semibold text-foreground">
                    Nenhuma notificação por aqui
                  </p>
                  <p className="mt-1.5 max-w-md text-[13px] text-muted-foreground">
                    {activeFilter === "all"
                      ? "Você está em dia com tudo."
                      : "Não há notificações nesta categoria por enquanto."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      onRead={markAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </MainContent>
    </div>
  );
}
