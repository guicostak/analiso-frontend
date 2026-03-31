"use client";

/**
 * useNotifications
 *
 * Gerencia estado e ações do painel de notificações.
 * Segue architecture_skill.md: toda lógica no hook, HTTP no service.
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { notificationsService } from "../services/notifications.service";
import type { Notification } from "../interfaces";

// ─── Tipos retornados ────────────────────────────────────────────────────────

interface UseNotificationsReturn {
  items:       Notification[];
  unreadCount: number;
  isLoading:   boolean;
  error:       string | null;
  markAsRead:    (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const { token } = useAuth();

  const [items,       setItems]       = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // Busca inicial
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    notificationsService
      .getNotifications(token)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setUnreadCount(res.unreadCount);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar notificações");
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [token]);

  // Marca uma notificação como lida (otimista)
  const markAsRead = useCallback(
    async (id: string) => {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationsService.markAsRead(token, id);
      } catch {
        // Reverte em caso de falha
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
        );
        setUnreadCount((prev) => prev + 1);
      }
    },
    [token],
  );

  // Marca todas como lidas (otimista)
  const markAllAsRead = useCallback(async () => {
    const hadUnread = items.some((n) => !n.read);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationsService.markAllAsRead(token);
    } catch {
      // Reverte apenas se havia não-lidas antes
      if (hadUnread) {
        setItems((prev) =>
          prev.map((n) =>
            items.find((o) => o.id === n.id && !o.read)
              ? { ...n, read: false }
              : n,
          ),
        );
        setUnreadCount(items.filter((n) => !n.read).length);
      }
    }
  }, [token, items]);

  return { items, unreadCount, isLoading, error, markAsRead, markAllAsRead };
}
