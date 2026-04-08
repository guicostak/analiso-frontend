"use client";

/**
 * ChangePasswordSection
 *
 * Formulário inline (sem modal) para troca de senha do usuário autenticado.
 * Hits PUT /api/me/password (204 No Content em sucesso).
 */

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuth } from "@/src/features/auth/AuthContext";
import { ApiError } from "@/src/lib/api";
import { accountService } from "../services/account.service";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_current_password: "Senha atual incorreta.",
  same_password: "A nova senha deve ser diferente da senha atual.",
  password_not_set:
    "Esta conta foi criada via login social e não possui senha definida.",
};

export function ChangePasswordSection() {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
  }

  function validate(): string | null {
    if (!currentPassword) return "Informe sua senha atual.";
    if (newPassword.length < 8) return "A nova senha deve ter pelo menos 8 caracteres.";
    if (newPassword !== confirmPassword) return "A confirmação não confere com a nova senha.";
    if (newPassword === currentPassword) return "A nova senha deve ser diferente da atual.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await accountService.changePassword({ currentPassword, newPassword }, token);
      setSuccess(true);
      resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(ERROR_MESSAGES[err.code] ?? "Não foi possível alterar sua senha. Tente novamente.");
      } else {
        setError("Erro de conexão. Verifique sua rede e tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        id="current-password"
        label="Senha atual"
        value={currentPassword}
        onChange={setCurrentPassword}
        visible={showCurrent}
        onToggleVisible={() => setShowCurrent((v) => !v)}
        autoComplete="current-password"
        disabled={submitting}
      />

      <PasswordField
        id="new-password"
        label="Nova senha"
        value={newPassword}
        onChange={setNewPassword}
        visible={showNew}
        onToggleVisible={() => setShowNew((v) => !v)}
        autoComplete="new-password"
        disabled={submitting}
        hint="Pelo menos 8 caracteres."
      />

      <PasswordField
        id="confirm-password"
        label="Confirmar nova senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        visible={showNew}
        autoComplete="new-password"
        disabled={submitting}
      />

      {error && (
        <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          Senha alterada com sucesso.
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-brand px-5 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(15,23,40,0.10)] transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible?: () => void;
  autoComplete: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className="h-11 w-full rounded-[12px] border border-border bg-card px-4 pr-10 text-[14px] text-foreground outline-none transition focus:border-brand disabled:opacity-60"
        />
        {onToggleVisible && (
          <button
            type="button"
            onClick={onToggleVisible}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
