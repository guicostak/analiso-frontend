/**
 * Timestamp relativo em pt-BR para uso em listas de notícias.
 *
 * Regras:
 *   < 1 min            → "agora"
 *   < 60 min           → "Xmin atrás"
 *   mesmo dia          → "hoje HH:mm"
 *   dia anterior       → "ontem HH:mm"
 *   ≤ 7 dias           → "Xd atrás"
 *   > 7 dias           → "DD MMM"  (ano só quando não é o ano atual)
 */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const hm = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `hoje ${hm}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return `ontem ${hm}`;

  if (diffDays <= 7) return `${diffDays}d atrás`;

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export type NewsTimeBucket = "today" | "yesterday" | "thisWeek" | "older";

export function bucketByDate(iso: string | null): NewsTimeBucket {
  if (!iso) return "older";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "older";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return "today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return "yesterday";

  if (diffDays <= 7) return "thisWeek";
  return "older";
}

export const BUCKET_LABEL: Record<NewsTimeBucket, string> = {
  today:     "Hoje",
  yesterday: "Ontem",
  thisWeek:  "Esta semana",
  older:     "Mais antigas",
};
