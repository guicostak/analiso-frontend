"use client";

import { ChevronDown } from "lucide-react";
import { AccountShell } from "./AccountShell";

function Toggle({ checked = true }: { checked?: boolean }) {
  return (
    <button
      className={`relative inline-flex h-7 w-[42px] items-center rounded-full p-1 transition ${
        checked ? "bg-[#12A594]" : "bg-[#E5E7EB]"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.10)] transition ${
          checked ? "translate-x-[13px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SelectField({ value, icon }: { value: string; icon?: React.ReactNode }) {
  return (
    <button className="flex h-[52px] w-[390px] items-center justify-between rounded-[16px] border border-[#E7EEF5] bg-white px-4 text-left text-[14px] text-[#171717] shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
      <span className="flex items-center gap-3">
        {icon}
        <span>{value}</span>
      </span>
      <ChevronDown className="h-5 w-5 text-[#171717]" />
    </button>
  );
}

function PreferenceRow({
  title,
  subtitle,
  control,
}: {
  title: string;
  subtitle: string;
  control: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-6 py-4 xl:grid-cols-[1fr_auto]">
      <div>
        <p className="text-[16px] font-semibold text-[#171717]">{title}</p>
        <p className="mt-1 text-[14px] text-[#8A8A8A]">{subtitle}</p>
      </div>
      <div className="xl:justify-self-end">{control}</div>
    </div>
  );
}

function PreferenceGroup({
  badge,
  children,
}: {
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#EEF2F6] py-8 last:border-b-0">
      <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
        <div>
          <span className="inline-flex rounded-[12px] bg-[#F4F4F5] px-3 py-2 text-[14px] font-semibold text-[#171717]">
            {badge}
          </span>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function PreferencesPage() {
  return (
    <AccountShell activeTab="preferencias">
      <section className="border-b border-[#EEF2F6] py-8">
        <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
          <div>
            <h2 className="text-[17px] font-semibold text-[#171717]">Preferências do sistema</h2>
            <p className="mt-2 text-[13px] text-[#8A8A8A]">Ajuste as preferências do sistema da Analiso</p>
          </div>
          <div />
        </div>
      </section>

      <PreferenceGroup badge="Geral">
        <PreferenceRow
          title="Resumo diário"
          subtitle="Receba um e-mail diário com sua agenda e atividades."
          control={<Toggle checked />}
        />
        <PreferenceRow
          title="Idioma"
          subtitle="Defina o idioma da plataforma."
          control={
            <SelectField
              value="Português (Brasil)"
              icon={<span className="text-[18px]">🇧🇷</span>}
            />
          }
        />
        <PreferenceRow
          title="Fuso horário"
          subtitle="Defina o fuso horário da sua conta."
          control={<SelectField value="UTC - 03:00 - Brasília" />}
        />
      </PreferenceGroup>

      <PreferenceGroup badge="Notificações">
        <PreferenceRow
          title="Notificações por Push"
          subtitle="Receba avisos diretamente no desktop ou smartphone."
          control={<Toggle checked />}
        />
        <PreferenceRow
          title="Notificações por SMS"
          subtitle="Receba avisos importantes por mensagem de texto (SMS)."
          control={<Toggle checked />}
        />
        <PreferenceRow
          title="Notificações por WhatsApp"
          subtitle="Receba notificações diretamente no WhatsApp para maior agilidade."
          control={<Toggle checked />}
        />
        <PreferenceRow
          title="Notificações por E-mail"
          subtitle="Receba notificações no seu e-mail cadastrado."
          control={<Toggle checked />}
        />
      </PreferenceGroup>
    </AccountShell>
  );
}
