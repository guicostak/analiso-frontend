"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

interface GoogleButtonProps {
  onSuccess?: (user: { email: string; name: string; picture: string }) => void;
  onError?: () => void;
}

export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("CredentialResponse:", credentialResponse);

    const idToken = credentialResponse.credential;

    if (!idToken) {
      console.error("ID Token não recebido");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      if (!response.ok) throw new Error("Falha na autenticação");

      const user = await response.json();
      console.log("Usuário autenticado:", user);
      onSuccess?.(user);
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      onError?.();
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.error("Login Google falhou");
        onError?.();
      }}
      text="signin_with"
      shape="rectangular"
    />
  );
}

export default GoogleButton;
