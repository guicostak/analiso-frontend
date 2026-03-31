"use client";

/**
 * NotificationsDropdown
 *
 * Botão sino + dropdown de notificações.
 * Segue design_skill.md: tokens semânticos, micro-interações, acessibilidade.
 */

import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCheck,
  Database,
  Info,
  Loader2,
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification, NotificationType } from "../interfaces";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  alerta:     { Icon: AlertTriangle, iconClass: "text-danger-text",   bgClass: "bg-danger-surface" },
  atualizacao:{ Icon: Database,      iconClass: "text-brand",          bgClass: "bg-brand-surface"  },
  agenda:     { Icon: Calendar,      iconClass: "text-warning-text",   bgClass: "bg-warning-surface"},
  sistema:    { Icon: Info,          iconClass: "text-muted-foreground",bgClass: "bg-muted"         },
};

// ─── Item ────────────────────────────────────────────────────────────────────

function NotificationItem({
  item,
  onRead,
}: {
  item:   Notification;
  onRead: (id: string) => void;
}) {
  const { Icon, iconClass, bgClass } = TYPE_CONFIG[item.type];

  return (
    <button
      type="button"
      onClick={() => { if (!item.read) onRead(item.id); }}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
        item.read ? "opacity-60" : ""
      }`}
    >
      {/* Ícone do tipo */}
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-[12px] font-semibold ${item.read ? "text-muted-foreground" : "text-foreground"}`}>
            {item.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {relativeTime(item.timestamp)}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
          {item.body}
        </p>

        {item.ticker && (
          <span className="mt-1.5 inline-block rounded-full border border-brand/20 bg-brand-surface px-2 py-0.5 text-[10px] font-semibold text-brand">
            {item.ticker}
          </span>
        )}
      </div>

      {/* Ponto de não-lido */}
      {!item.read && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
      )}
    </button>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

interface NotificationsDropdownProps {
  open:    boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ open, onClose }: NotificationsDropdownProps) {
  const { items, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notificações"
      className="absolute right-0 top-[calc(100%+6px)] z-50 w-[360px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground">Notificações</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <Bell className="mb-3 h-7 w-7 text-muted-foreground/40" />
            <p className="text-[13px] font-medium text-foreground">Nenhuma notificação</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Você está em dia com tudo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <NotificationItem key={item.id} item={item} onRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Botão sino (exportado para uso no AppTopBar) ─────────────────────────────

interface NotificationsBellProps {
  open:     boolean;
  onToggle: () => void;
}

export function NotificationsBell({ open, onToggle }: NotificationsBellProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-hover ${
        open ? "bg-hover" : ""
      }`}
      aria-label="Notificações"
      aria-expanded={open}
    >
      <Bell className="h-[18px] w-[18px] text-muted-foreground" />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-0.5 text-[9px] font-bold leading-none text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
