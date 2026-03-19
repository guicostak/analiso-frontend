"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// -------------------------------------------------------
// Types — espelham exatamente os DTOs do backend
// -------------------------------------------------------

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

/** Forma normalizada passada para onSuccess */
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

interface GoogleButtonProps {
  onSuccess?: (user: GoogleAuthUser) => void;
  onError?: () => void;
}

// -------------------------------------------------------
// Componente
// -------------------------------------------------------

export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      console.error("[auth] ID Token não recebido do Google");
      onError?.();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as BackendAuthResponse;

      console.log("[auth] resposta bruta do backend:", JSON.stringify(data));
      console.log("[auth] isNewUser recebido:", data.isNewUser, "| tipo:", typeof data.isNewUser);

      onSuccess?.({
        id:        data.user.id,
        email:     data.user.email,
        name:      data.user.name,
        picture:   data.user.avatarUrl,
        token:     data.accessToken,
        isNewUser: data.isNewUser,
      });
    } catch (error) {
      console.error("[auth] Erro ao autenticar com backend:", error);
      onError?.();
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.error("[auth] Login Google falhou");
        onError?.();
      }}
      text="signin_with"
      shape="rectangular"
    />
  );
}

export default GoogleButton;
