// ─── Tipos da feature Luiz ────────────────────────────────────────────────────

/** Remetente da mensagem */
export type LuizMessageRole = "user" | "luiz";

/**
 * Comando que o Luiz pode executar na plataforma.
 * Retornado pela API quando o modelo decide acionar uma ferramenta.
 */
export interface LuizCommand {
  /** Tipo de ação a executar */
  type: "navigate";
  /** Rota de destino (ex: "/explorar?pl_max=10") */
  href: string;
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
