/**
 * Telemetria local da feature Compare.
 *
 * Wrapper fino sobre console.log — placeholder para uma integração futura
 * (Amplitude, Segment, PostHog, etc.). Mantido isolado para que a substituição
 * por uma chamada real seja trivial: basta editar este arquivo.
 *
 * Convenção de nomes de eventos: `compare_<verbo_alvo>` em snake_case.
 */

export type CompareTelemetryEvent =
  | "compare_build_mode_started"
  | "compare_build_mode_completed"
  | "compare_suggestion_clicked"
  | "compare_save_clicked"
  | "compare_share_clicked"
  | "compare_history_opened"
  | "compare_history_item_selected"
  | "compare_verdict_action"
  | "compare_island_expanded"
  | "compare_empty_state_viewed";

export function trackCompare(
  event: CompareTelemetryEvent,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.log("[analytics]", event, props ?? {});
}
