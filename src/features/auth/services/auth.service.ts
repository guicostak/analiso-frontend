import { API_BASE_URL } from "@/src/lib/api-base";
import { ApiError } from "@/src/lib/api";
import type {
  EmailAuthResponse,
  EmailLoginRequest,
  EmailRegisterRequest,
  SendVerificationRequest,
  VerifyCodeRequest,
} from "../interfaces/auth.interfaces";

// ── DTOs do Google Auth ────────────────────────────────────────────────────────

interface BackendAuthResponse {
  accessToken: string;
  tokenType: string;
  isNewUser: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    avatarUrl: string;
    emailVerified: boolean;
  };
}

/** Modelo normalizado retornado após autenticação Google com sucesso */
export interface GoogleAuthUser {
  id: number;
  email: string;
  name: string;
  /** Foto do perfil Google (avatarUrl no backend) */
  picture: string;
  /** JWT emitido pelo backend */
  token: string;
  /** true quando o usuário acabou de ser criado (primeiro login) */
  isNewUser: boolean;
}

// ── Helper interno ─────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[auth] network failure", { path, error });
    throw new ApiError(0, "network_error", "network_error");
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
    };
    throw new ApiError(
      response.status,
      data.code ?? "unknown_error",
      data.message ?? `auth_${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

// ── Service ────────────────────────────────────────────────────────────────────

export const authService = {
  registerWithEmail: (payload: EmailRegisterRequest) =>
    post<EmailAuthResponse>("/api/auth/register", payload),

  loginWithEmail: (payload: EmailLoginRequest) =>
    post<EmailAuthResponse>("/api/auth/login", payload),

  /**
   * Envia o código de verificação.
   * Passa pelo proxy Next.js (/api/auth/verification/send) que bloqueia usuários Google.
   * O token é enviado no cabeçalho Authorization para que o proxy possa inspecionar o provider.
   */
  sendVerification: async (payload: SendVerificationRequest, token?: string | null): Promise<void> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch("/api/auth/verification/send", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[auth] sendVerification network failure", error);
      throw new ApiError(0, "network_error", "network_error");
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        code?: string;
      };
      throw new ApiError(
        response.status,
        data.code ?? "unknown_error",
        data.message ?? `auth_${response.status}`,
      );
    }
  },

  verifyCode: (payload: VerifyCodeRequest) =>
    post<void>("/api/auth/verification/verify", payload),

  /**
   * Autentica o usuário via Google ID Token.
   * Envia o token para o backend e retorna o modelo normalizado.
   */
  googleAuth: async (idToken: string): Promise<GoogleAuthUser> => {
    const data = await post<BackendAuthResponse>("/api/auth/google", { token: idToken });

    console.log("[auth] resposta bruta do backend:", JSON.stringify(data));
    console.log("[auth] isNewUser recebido:", data.isNewUser, "| tipo:", typeof data.isNewUser);

    return {
      id:        data.user.id,
      email:     data.user.email,
      name:      data.user.name,
      picture:   data.user.avatarUrl,
      token:     data.accessToken,
      isNewUser: data.isNewUser,
    };
  },
};
