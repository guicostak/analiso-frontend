/**
 * Telemetria local da feature Analysis.
 *
 * Wrapper fino sobre console.log — placeholder para integração futura
 * (Amplitude, Segment, PostHog, etc.). Mantido isolado para que a substituição
 * por uma chamada real seja trivial: basta editar este arquivo.
 *
 * Convenção de nomes: `analysis_<verbo_alvo>` em snake_case.
 */

export type AnalysisTelemetryEvent =
  | "analysis_viewed"
  | "analysis_watchlist_toggled"
  | "analysis_share_clicked"
  | "analysis_compare_clicked"
  | "analysis_alert_interest"
  | "analysis_verdict_action"
  | "analysis_tab_selected"
  | "analysis_pdf_clicked"
  | "analysis_pdf_success"
  | "analysis_pdf_failed";

export function trackAnalysis(
  event: AnalysisTelemetryEvent,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.log("[analytics]", event, props ?? {});
}
