"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import type { AuthMode, EmailAuthUser } from "../interfaces/auth.interfaces";
import { useEmailAuth } from "../hooks/useEmailAuth";

interface EmailAuthFormProps {
  onSuccess: (user: EmailAuthUser) => void;
}

export function EmailAuthForm({ onSuccess }: EmailAuthFormProps) {
  const {
    mode,
    step,
    email,
    name,
    password,
    verificationCode,
    pendingUser,
    isLoading,
    error,
    setMode,
    setEmail,
    setName,
    setPassword,
    setVerificationCode,
    submit,
    submitVerification,
    resendVerification,
  } = useEmailAuth({ onSuccess });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    void submitVerification();
  };

  // ── Step de verificação de e-mail ──────────────────────────────────────────
  if (step === "verify-email" && pendingUser) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand/10">
            <Mail className="h-6 w-6 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Verifique seu e-mail</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Enviamos um código de verificação para{" "}
              <span className="font-medium text-foreground">{pendingUser.email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4" noValidate>
          <FormField
            id="auth-code"
            label="Código de verificação"
            type="text"
            value={verificationCode}
            onChange={setVerificationCode}
            placeholder="000000"
            autoComplete="one-time-code"
            required
          />

          {error && (
            <p role="alert" className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || verificationCode.length === 0}
            className="w-full mt-1 py-3.5 px-4 rounded-full bg-brand text-white text-sm font-semibold tracking-wide
              hover:bg-brand/90 active:scale-[0.98] transition-[color,background-color,transform,opacity]
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 focus:ring-offset-muted"
          >
            {isLoading ? "Verificando..." : "Confirmar e-mail"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Não recebeu?{" "}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void resendVerification()}
            className="text-brand font-medium hover:underline disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
          >
            Reenviar código
          </button>
        </p>
      </div>
    );
  }

  // ── Formulário principal ───────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Mode tabs */}
      <div className="flex rounded-xl border border-border bg-muted p-1 mb-6">
        <TabButton
          label="Entrar"
          active={mode === "login"}
          onClick={() => setMode("login")}
        />
        <TabButton
          label="Criar conta"
          active={mode === "register"}
          onClick={() => setMode("register")}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {mode === "register" && (
          <FormField
            id="auth-name"
            label="Nome completo"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Seu nome"
            autoComplete="name"
            required
          />
        )}

        <FormField
          id="auth-email"
          label="E-mail"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          autoComplete={mode === "login" ? "username" : "email"}
          required
        />


        <FormField
          id="auth-password"
          label="Senha"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Sua senha"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />

        {error && (
          <p role="alert" className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-3.5 px-4 rounded-full bg-brand text-white text-sm font-semibold tracking-wide
            hover:bg-brand/90 active:scale-[0.98] transition-[color,background-color,transform,opacity]
            disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 focus:ring-offset-muted"
        >
          {isLoading
            ? mode === "register"
              ? "Criando conta..."
              : "Entrando..."
            : mode === "register"
              ? "Criar conta"
              : "Entrar"}
        </button>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
        focus:outline-none focus:ring-2 focus:ring-brand/40
        ${
          active
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {label}
    </button>
  );
}

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-foreground tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full px-4 py-3 rounded-xl border border-border bg-card
            text-sm text-foreground placeholder:text-muted-foreground/60
            focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
            transition-colors ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default EmailAuthForm;
