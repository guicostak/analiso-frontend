export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  /** Suporta negrito simples via **texto** */
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean;
}
