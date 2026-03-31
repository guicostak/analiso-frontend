"use client";

import { Chrome, Laptop, Shield, Trash2, User } from "lucide-react";
import { AccountShell } from "./AccountShell";

function SecurityActionRow({
  title,
  subtitle,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
}) {
  return (
    <div className="grid items-center gap-6 py-4 xl:grid-cols-[1fr_auto]">
      <div>
        <p className="text-[16px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="xl:justify-self-end">
        <button className="inline-flex h-10 items-center justify-center rounded-[15px] border border-border bg-card px-4.5 text-[14px] font-semibold text-foreground shadow-[0_8px_18px_rgba(15,23,40,0.05)]">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function SecurityPage() {
  return (
    <AccountShell activeTab="seguranca">
      <section className="border-b border-border py-8">
        <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
          <div>
            <h2 className="text-[17px] font-semibold text-foreground">Acesso à Analiso</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">Gerencie formas de acessar a Analiso</p>
          </div>

          <div className="space-y-3">
            <SecurityActionRow
              title="Senha de acesso"
              subtitle="Atualize a senha usada para acessar sua conta."
              actionLabel="Alterar senha"
            />
            <SecurityActionRow
              title="E-mail de acesso"
              subtitle="Atualize o e-mail utilizado para acessar sua conta."
              actionLabel="Alterar E-mail"
            />
            <SecurityActionRow
              title="Autenticação de dois fatores"
              subtitle="Proteja sua conta com uma verificação adicional ao fazer login."
              actionLabel="Habilitar"
            />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div>
          <h2 className="text-[17px] font-semibold text-foreground">Dispositivos conectado</h2>
        </div>

        <div className="mt-8 overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_8px_20px_rgba(15,23,40,0.04)]">
          <div className="grid grid-cols-[1.4fr_0.36fr_0.36fr_56px] border-b border-border bg-background">
            <div className="flex items-center gap-3 px-5 py-4 text-[14px] font-semibold text-foreground">
              <User className="h-4 w-4 text-muted-foreground/60" />
              <span>Navegador</span>
            </div>
            <div className="flex items-center gap-3 border-l border-border px-5 py-4 text-[14px] font-semibold text-foreground">
              <Laptop className="h-4 w-4 text-muted-foreground/60" />
              <span>Dispositivo</span>
            </div>
            <div className="flex items-center gap-3 border-l border-border px-5 py-4 text-[14px] font-semibold text-foreground">
              <Shield className="h-4 w-4 text-muted-foreground/60" />
              <span>Status</span>
            </div>
            <div className="border-l border-border" />
          </div>

          <div className="grid grid-cols-[1.4fr_0.36fr_0.36fr_56px] items-center">
            <div className="flex items-center gap-4 px-5 py-5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-[0_4px_10px_rgba(15,23,40,0.06)]">
                <Chrome className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-[14px] text-foreground">Chrome OS X</span>
            </div>
            <div className="border-l border-border px-5 py-5">
              <span className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-semibold text-foreground">
                Desktop
              </span>
            </div>
            <div className="border-l border-border px-5 py-5">
              <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-[12px] font-semibold text-blue-500">
                Dispositivo atual
              </span>
            </div>
            <div className="flex items-center justify-center border-l border-border px-3 py-5">
              <button className="text-muted-foreground transition hover:text-foreground">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </AccountShell>
  );
}
