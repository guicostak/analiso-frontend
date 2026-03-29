"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { authService, type GoogleAuthUser } from "../services/auth.service";

// Re-export para compatibilidade com importadores existentes
export type { GoogleAuthUser };

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
      const user = await authService.googleAuth(idToken);
      onSuccess?.(user);
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
      shape="pill"
    />
  );
}

export default GoogleButton;
