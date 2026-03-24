"use client";

import { useState } from "react";
import { authService } from "../services/auth.service";
import type { AuthMode, EmailAuthUser } from "../interfaces/auth.interfaces";

interface UseEmailAuthOptions {
  onSuccess: (user: EmailAuthUser) => void;
  onError?: (message: string) => void;
}

interface EmailAuthState {
  mode: AuthMode;
  email: string;
  name: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

export function useEmailAuth({ onSuccess, onError }: UseEmailAuthOptions) {
  const [state, setState] = useState<EmailAuthState>({
    mode: "login",
    email: "",
    name: "",
    password: "",
    isLoading: false,
    error: null,
  });

  const setMode = (mode: AuthMode) =>
    setState((prev) => ({ ...prev, mode, error: null }));

  const setField = (field: keyof Pick<EmailAuthState, "email" | "name" | "password">) =>
    (value: string) =>
      setState((prev) => ({ ...prev, [field]: value, error: null }));

  const submit = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data =
        state.mode === "register"
          ? await authService.registerWithEmail({
              email: state.email,
              name: state.name,
              password: state.password,
            })
          : await authService.loginWithEmail({
              email: state.email,
              password: state.password,
            });

      onSuccess({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        picture: data.user.avatarUrl ?? "",
        token: data.accessToken,
        isNewUser: data.isNewUser,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      onError?.(message);
    }
  };

  return {
    mode: state.mode,
    email: state.email,
    name: state.name,
    password: state.password,
    isLoading: state.isLoading,
    error: state.error,
    setMode,
    setEmail: setField("email"),
    setName: setField("name"),
    setPassword: setField("password"),
    submit,
  };
}
