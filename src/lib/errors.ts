/**
 * Centralized error normalization for API and runtime errors.
 *
 * Goal: never leak technical details (URLs, status codes, stack traces) to
 * the end user. Always return a friendly Portuguese message and a category
 * the UI can use to decide how to react (toast, retry button, redirect…).
 */
import { ApiError } from "@/src/lib/api";

export type ApiErrorType =
  | "network"
  | "auth"
  | "forbidden"
  | "not_found"
  | "validation"
  | "rate_limit"
  | "server"
  | "unknown";

export interface NormalizedError {
  type: ApiErrorType;
  /** User-friendly Portuguese message safe to display directly. */
  message: string;
  /** Whether the action that triggered the error can reasonably be retried. */
  retryable: boolean;
  /** Original error code (when available) — useful for telemetry only. */
  code?: string;
  /** HTTP status (when available) — useful for telemetry only. */
  status?: number;
}

/**
 * Map of backend error codes to user-friendly messages.
 * Extend as new error codes appear in the API contract.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  invalid_credentials: "E-mail ou senha incorretos. Verifique e tente novamente.",
  email_already_exists: "Este e-mail já está cadastrado. Tente fazer login.",
  email_not_verified: "Confirme seu e-mail antes de continuar.",
  invalid_token: "Sessão expirada. Faça login novamente.",
  expired_token: "Sessão expirada. Faça login novamente.",
  weak_password: "A senha é muito fraca. Use ao menos 8 caracteres com letras e números.",
  invalid_password: "Senha incorreta. Tente novamente.",
  user_not_found: "Usuário não encontrado.",

  // Subscription / billing
  subscription_required: "Esta funcionalidade requer um plano ativo.",
  payment_failed: "Não foi possível processar o pagamento. Verifique seus dados e tente novamente.",
  subscription_not_found: "Não encontramos uma assinatura ativa.",

  // Resources
  ticker_not_found: "Não encontramos esse ativo. Verifique o código e tente novamente.",
  company_not_found: "Empresa não encontrada.",
  watchlist_not_ready: "Sua watchlist ainda está sendo preparada. Tente novamente em instantes.",
  analysis_not_available: "A análise deste ativo ainda não está disponível.",

  // Validation
  invalid_request: "Os dados informados são inválidos. Verifique e tente novamente.",
  validation_error: "Os dados informados são inválidos. Verifique e tente novamente.",
  missing_field: "Preencha todos os campos obrigatórios.",

  // Rate limiting / quota
  rate_limited: "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.",
  quota_exceeded: "Você atingiu o limite do seu plano. Faça upgrade para continuar.",

  // Generic fallbacks (kept here so UI never displays raw codes)
  unknown_error: "Algo não saiu como esperado. Tente novamente em instantes.",
};

const DEFAULT_BY_TYPE: Record<ApiErrorType, string> = {
  network: "Não foi possível se conectar. Verifique sua internet e tente novamente.",
  auth: "Sua sessão expirou. Faça login novamente para continuar.",
  forbidden: "Você não tem permissão para acessar este recurso.",
  not_found: "Não encontramos o que você procura.",
  validation: "Os dados informados são inválidos. Verifique e tente novamente.",
  rate_limit: "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.",
  server: "Nossos servidores estão com instabilidade. Tente novamente em instantes.",
  unknown: "Algo não saiu como esperado. Tente novamente em instantes.",
};

function categorize(status?: number): ApiErrorType {
  if (status == null) return "unknown";
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 408) return "network";
  if (status === 429) return "rate_limit";
  if (status >= 400 && status < 500) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch network failure
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("networkerror") ||
      msg.includes("load failed") ||
      msg.includes("nao foi possivel conectar") ||
      msg.includes("não foi possível conectar")
    );
  }
  return false;
}

/**
 * Normalize any error into a safe, user-friendly shape.
 * Never throws — always returns a NormalizedError.
 */
export function normalizeApiError(err: unknown): NormalizedError {
  if (err instanceof ApiError) {
    // status 0 / code "network_error" is the sentinel apiFetch throws
    // when the underlying fetch() rejects (offline, CORS, DNS, …).
    if (err.status === 0 || err.code === "network_error") {
      return {
        type: "network",
        message: DEFAULT_BY_TYPE.network,
        retryable: true,
        code: err.code,
        status: err.status,
      };
    }
    const type = categorize(err.status);
    const message =
      (err.code && ERROR_MESSAGES[err.code]) ||
      DEFAULT_BY_TYPE[type];
    return {
      type,
      message,
      retryable: type === "network" || type === "server" || type === "rate_limit",
      code: err.code,
      status: err.status,
    };
  }

  if (isNetworkError(err)) {
    return {
      type: "network",
      message: DEFAULT_BY_TYPE.network,
      retryable: true,
    };
  }

  return {
    type: "unknown",
    message: DEFAULT_BY_TYPE.unknown,
    retryable: true,
  };
}

/**
 * Convenience: just the friendly message. Useful in toast.error(getErrorMessage(err)).
 */
export function getErrorMessage(err: unknown): string {
  return normalizeApiError(err).message;
}
