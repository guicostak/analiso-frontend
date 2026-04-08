// ─── Tipos da feature Luiz ────────────────────────────────────────────────────

/** Remetente da mensagem */
export type LuizMessageRole = "user" | "luiz";

/** Tipos de comando que o Luiz pode executar */
export type LuizCommandType =
  | "navigate"
  | "theme"
  | "glossary"
  | "watchlist_add"
  | "watchlist_remove"
  | "compare_layout";

/**
 * Ação de customização da tela de comparação (Fase 3 — generative UI).
 * Despachada via CustomEvent "luiz:compare-layout" e consumida pela ComparePage.
 */
export type CompareLayoutAction =
  | { action: "apply_template"; templateId: string }
  | { action: "set_order"; order: string[]; name?: string; description?: string }
  | { action: "hide"; ids: string[] }
  | { action: "show"; ids: string[] }
  | { action: "reset" };

/**
 * Comando que o Luiz pode executar na plataforma.
 * Retornado pela API quando o modelo decide acionar uma ferramenta.
 */
export interface LuizCommand {
  /** Tipo de ação a executar */
  type: LuizCommandType;
  /**
   * Valor do comando:
   * - navigate: rota de destino (ex: "/buscar?pl_max=10")
   * - theme: "dark" | "light"
   * - glossary: "" (sem valor)
   * - watchlist_add/remove: ticker (ex: "PETR4")
   * - compare_layout: "" (o payload real vai em `layoutAction`)
   */
  href: string;
  /** Payload do comando compare_layout (opcional, só preenchido quando type === "compare_layout"). */
  layoutAction?: CompareLayoutAction;
}

/** Uma mensagem na conversa */
export interface LuizMessage {
  id: string;
  role: LuizMessageRole;
  /** Conteúdo com suporte a **bold** via markdown simples */
  content: string;
  timestamp: Date;
  /** Sugestões de resposta rápida exibidas abaixo da mensagem */
  suggestions?: string[];
  /** Comando de plataforma embutido na mensagem (opcional) */
  command?: LuizCommand;
}

/** Resposta que o serviço retorna */
export interface LuizServiceResponse {
  content: string;
  suggestions?: string[];
  command?: LuizCommand;
  /** Delay simulado em ms (apenas no modo mock) */
  delay?: number;
}

/** Formato do histórico enviado para a API */
export interface LuizHistoryEntry {
  role: "user" | "assistant";
  content: string;
}
