// ─── Pure utility formatters for analysis data ───────────────────────────────

/** Null-safe number formatter. Returns "0.0" (or given decimals) for null/undefined. */
export const safeN = (n: number | null | undefined, d = 1): string =>
  (n ?? 0).toFixed(d);

/** Null-safe number formatter with Brazilian comma decimal. */
export const safeNbr = (n: number | null | undefined, d = 1): string =>
  (n ?? 0).toFixed(d).replace('.', ',');

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)} bi`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)} mi`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)} mil`;
  return n.toFixed(1);
}

/** Formats a raw BRL value (in full units) as "R$ X,XX bi" or "R$ X,XX mi" */
export function fmtBRL(n: number | null | undefined): string {
  if (n == null) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}R$ ${(abs / 1e9).toFixed(2).replace('.', ',')} bi`;
  if (abs >= 1e6) return `${sign}R$ ${(abs / 1e6).toFixed(2).replace('.', ',')} mi`;
  if (abs >= 1e3) return `${sign}R$ ${(abs / 1e3).toFixed(1).replace('.', ',')} mil`;
  return `${sign}R$ ${abs.toFixed(0)}`;
}

/**
 * Formata uma string de data ISO (YYYY-MM-DD) para o padrão brasileiro DD/MM/YYYY.
 * Strings que já estão em outro formato (ex: "Mar 2026") são retornadas sem alteração.
 * Seguro contra problemas de timezone — não usa `new Date()` para dates without time.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  return dateStr; // já formatado (ex: "Mar 2026") — retorna sem alterar
}

export function timeAgo(isoStr?: string): string {
  if (!isoStr) return '';
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)   return 'Atualizado agora';
  if (diff < 3600) return `Atualizado há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Atualizado há ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
  return `Atualizado há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
}
