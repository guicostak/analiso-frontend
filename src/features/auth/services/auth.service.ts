import { API_BASE_URL } from "@/src/lib/api-base";
import type {
  EmailAuthResponse,
  EmailLoginRequest,
  EmailRegisterRequest,
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? `HTTP ${response.status}`);
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
