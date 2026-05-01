"use client";

import { useState } from "react";
import { authService } from "../services/auth.service";
import { normalizeApiError } from "@/src/lib/errors";
import type { AuthMode, EmailAuthUser } from "../interfaces/auth.interfaces";

interface UseEmailAuthOptions {
  onSuccess: (user: EmailAuthUser) => void;
  onError?: (message: string) => void;
}

type AuthStep = "form" | "verify-email";

interface EmailAuthState {
  mode: AuthMode;
  step: AuthStep;
  email: string;
  name: string;
  password: string;
  verificationCode: string;
  pendingUser: EmailAuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useEmailAuth({ onSuccess, onError }: UseEmailAuthOptions) {
  const [state, setState] = useState<EmailAuthState>({
    mode: "login",
    step: "form",
    email: "",
    name: "",
    password: "",
    verificationCode: "",
    pendingUser: null,
    isLoading: false,
    error: null,
  });

  const setMode = (mode: AuthMode) =>
    setState((prev) => ({ ...prev, mode, step: "form", error: null }));

  const setField =
    (field: keyof Pick<EmailAuthState, "email" | "name" | "password" | "verificationCode">) =>
    (value: string) =>
      setState((prev) => ({ ...prev, [field]: value, error: null }));

  const submit = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (state.mode === "login") {
        const data = await authService.loginWithEmail({
          email: state.email,
          password: state.password,
        });

        onSuccess({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.avatarUrl ?? "",
          token: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          isNewUser: data.isNewUser,
        });
      } else {
        const data = await authService.registerWithEmail({
          email: state.email,
          name: state.name,
          password: state.password,
        });

        const user: EmailAuthUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.avatarUrl ?? "",
          token: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          isNewUser: data.isNewUser,
        };

        // Envia email de verificação automaticamente
        await authService.sendVerification(
          { target: data.user.email, channel: "email" },
          data.accessToken,
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          step: "verify-email",
          pendingUser: user,
          error: null,
        }));
        return;
      }
    } catch (err) {
      const { message } = normalizeApiError(err);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      onError?.(message);
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  };

  const submitVerification = async () => {
    if (!state.pendingUser) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.verifyCode({
        target: state.pendingUser.email,
        channel: "email",
        code: state.verificationCode,
      });

      onSuccess(state.pendingUser);
    } catch (err) {
      const { message } = normalizeApiError(err);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      onError?.(message);
    }
  };

  const resendVerification = async () => {
    if (!state.pendingUser) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.sendVerification(
        { target: state.pendingUser.email, channel: "email" },
        state.pendingUser.token,
      );
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const { message } = normalizeApiError(err);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  };

  return {
    mode: state.mode,
    step: state.step,
    email: state.email,
    name: state.name,
    password: state.password,
    verificationCode: state.verificationCode,
    pendingUser: state.pendingUser,
    isLoading: state.isLoading,
    error: state.error,
    setMode,
    setEmail: setField("email"),
    setName: setField("name"),
    setPassword: setField("password"),
    setVerificationCode: setField("verificationCode"),
    submit,
    submitVerification,
    resendVerification,
  };
}
