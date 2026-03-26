import { API_BASE_URL } from "@/src/lib/api-base";
import type {
  EmailAuthResponse,
  EmailLoginRequest,
  EmailRegisterRequest,
} from "../interfaces/auth.interfaces";

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

export const authService = {
  registerWithEmail: (payload: EmailRegisterRequest) =>
    post<EmailAuthResponse>("/api/auth/register", payload),

  loginWithEmail: (payload: EmailLoginRequest) =>
    post<EmailAuthResponse>("/api/auth/login", payload),
};
