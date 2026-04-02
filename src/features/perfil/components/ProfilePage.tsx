"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Chrome,
  CreditCard,
  FileText,
  Laptop,
  Lock,
  Mail,
  Settings2,
  Shield,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/src/features/auth/AuthContext";
import { AccountShell } from "./AccountShell";
import { fetchPlans, fetchSubscription, cancelSubscription, updateAutoRenew } from "@/src/features/assinatura/services";
import type { SubscriptionData } from "@/src/features/assinatura/services";
import { SubscriptionPlanCard } from "@/src/features/assinatura/components/SubscriptionPlanCard";
import type { BillingCycle, SubscriptionPlan } from "@/src/features/assinatura/interfaces";
import { Check, Calendar, RefreshCw, Loader2 } from "lucide-react";

/* ─── Tipos auxiliares ─── */
type AccountField = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

type SectionId = "conta" | "preferencias" | "seguranca" | "pagamento" | "assinatura" | "alertas";

const sections: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "conta", label: "Minha conta", icon: User },
  { id: "preferencias", label: "Preferências", icon: Settings2 },
  { id: "seguranca", label: "Segurança", icon: Lock },
  { id: "pagamento", label: "Pagamento", icon: Wallet },
  { id: "assinatura", label: "Assinatura", icon: CreditCard },
  { id: "alertas", label: "Alertas", icon: Bell },
];

/* personalFields is now dynamic — built inside ProfilePage() */

/* ─── Componentes internos ─── */

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-2 text-[13px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ProfileSection({
  title,
  subtitle,
  actionLabel,
  children,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-8 last:border-b-0">
      <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr_auto]">
        <SectionHeading title={title} subtitle={subtitle} />
        <div>{children}</div>
        {actionLabel ? (
          <div className="flex xl:justify-end">
            <button className="inline-flex h-10 items-center justify-center rounded-[15px] border border-border bg-card px-4.5 text-[14px] font-semibold text-foreground shadow-[0_8px_18px_rgba(15,23,40,0.05)]">
              {actionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FieldList({ fields }: { fields: AccountField[] }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div key={field.label} className="grid grid-cols-[220px_1fr] items-center gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-[13px]">{field.label}</span>
            </div>
            <div className="text-[14px] font-medium text-foreground">{field.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function Toggle({ checked = true }: { checked?: boolean }) {
  return (
    <button
      className={`relative inline-flex h-7 w-[42px] items-center rounded-full p-1 transition ${
        checked ? "bg-brand" : "bg-muted"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-card shadow-[0_2px_6px_rgba(0,0,0,0.10)] transition ${
          checked ? "translate-x-[13px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SelectField({ value, icon }: { value: string; icon?: React.ReactNode }) {
  return (
    <button className="flex h-[52px] w-full max-w-[390px] items-center justify-between rounded-[16px] border border-border bg-card px-4 text-left text-[14px] text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.04)]">
      <span className="flex items-center gap-3">
        {icon}
        <span>{value}</span>
      </span>
      <ChevronDown className="h-5 w-5 text-foreground" />
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
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="xl:justify-self-end">{control}</div>
    </div>
  );
}

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
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="xl:justify-self-end">
        <button className="inline-flex h-10 items-center justify-center rounded-[15px] border border-border bg-card px-4.5 text-[14px] font-semibold text-foreground shadow-[0_8px_18px_rgba(15,23,40,0.05)]">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

/* ─── Página principal ─── */

function formatPriceCents(cents: number): string {
  return `R$ ${Math.floor(cents / 100)}`;
}

export function ProfilePage() {
  const { user, token } = useAuth();

  const personalFields: AccountField[] = [
    { icon: User, label: "Nome completo", value: user?.name ?? "—" },
    { icon: Mail, label: "E-mail", value: user?.email ?? "—" },
  ];

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: SectionId = (tabParam === "preferencias" || tabParam === "seguranca" || tabParam === "pagamento" || tabParam === "assinatura" || tabParam === "alertas") ? tabParam : "conta";
  const [activeSection, setActiveSection] = useState<SectionId>(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const section: SectionId = (tab === "preferencias" || tab === "seguranca" || tab === "pagamento" || tab === "assinatura" || tab === "alertas") ? tab : "conta";
    setActiveSection(section);
  }, [searchParams]);
  const [cycle, setCycle] = useState<BillingCycle>("Anual");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchSubscription(token).then((data) => {
      setSubscription(data);
      if (data?.status === "active") {
        setCycle(data.billingCycle === "anual" ? "Anual" : "Mensal");
      }
    }).catch(() => {});
  }, [token]);

  const handleSubscribe = (planId: string) => {
    const billingCycle = cycle === "Anual" ? "anual" : "mensal";
    window.location.href = `/assinatura/checkout?plan=${planId}&cycle=${billingCycle}`;
  };

  const handleCancel = async () => {
    if (!token) return;
    setLoadingAction("cancel");
    try {
      const data = await cancelSubscription(token);
      setSubscription(data);
    } catch { /* ignore */ } finally { setLoadingAction(null); }
  };

  const handleToggleAutoRenew = async () => {
    if (!token || !subscription) return;
    setLoadingAction("auto-renew");
    try {
      const data = await updateAutoRenew(token, !subscription.autoRenew);
      setSubscription(data);
    } catch { /* ignore */ } finally { setLoadingAction(null); }
  };

  const activePlanId = subscription?.status === "active" ? subscription.plan : null;
  const activeBillingCycle = subscription?.status === "active" ? subscription.billingCycle : null;
  const activePlan = activePlanId ? plans.find(p => p.id === activePlanId) : null;

  return (
    <AccountShell activeTab="conta">
      {/* ── Ilha principal ── */}
      <div className="mt-6 overflow-hidden rounded-[24px] border border-border bg-card">

      {/* ── Navegação por seção ── */}
      <div className="border-b border-border px-6">
        <div className="flex flex-wrap gap-1.5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = sec.id === activeSection;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-3.5 text-[12px] transition ${
                  isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-[14px] w-[14px]" />
                {sec.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-brand" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Conteúdo da seção ativa ── */}
      <div className="px-6 bg-card">
        {/* ━━━ MINHA CONTA ━━━ */}
        {activeSection === "conta" && (
          <>
            <ProfileSection title="Foto de perfil" subtitle="Atualize sua foto de perfil">
              <div className="flex flex-col items-start gap-4">
                <div className="h-[52px] w-[52px] overflow-hidden rounded-[16px] border border-border bg-card">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Envie a foto</p>
                  <p className="mt-1 text-[14px] text-muted-foreground">JPG ou PNG · até 1 MB · até 250×250 px</p>
                </div>
                <button className="inline-flex h-10 items-center justify-center rounded-[15px] border border-border bg-card px-4.5 text-[14px] font-semibold text-foreground shadow-[0_8px_18px_rgba(15,23,40,0.05)]">
                  Alterar foto
                </button>
              </div>
            </ProfileSection>

            <ProfileSection
              title="Informações pessoais"
              subtitle="Edite informações da sua conta"
              actionLabel="Editar informações"
            >
              <FieldList fields={personalFields} />
              <div className="mt-4 flex flex-wrap gap-2">
                {user?.provider !== "google" && (
                  user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-surface px-3 py-1 text-[11px] font-medium text-success-text">
                      <Mail className="h-3 w-3" />
                      E-mail verificado
                    </span>
                  ) : (
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-[11px] font-medium text-warning-text transition hover:opacity-80">
                      <Mail className="h-3 w-3" />
                      Verificar e-mail
                    </button>
                  )
                )}
              </div>
            </ProfileSection>

          </>
        )}

        {/* ━━━ PREFERÊNCIAS ━━━ */}
        {activeSection === "preferencias" && (
          <>
            <div className="border-b border-border py-8">
              <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
                <SectionHeading title="Preferências do sistema" subtitle="Ajuste as preferências do sistema da Analiso" />
                <div />
              </div>
            </div>

            {/* Geral */}
            <div className="border-b border-border py-8 last:border-b-0">
              <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
                <div>
                  <span className="inline-flex rounded-[12px] bg-muted px-3 py-2 text-[14px] font-semibold text-foreground">
                    Geral
                  </span>
                </div>
                <div>
                  <PreferenceRow title="Resumo diário" subtitle="Receba um e-mail diário com sua agenda e atividades." control={<Toggle checked />} />
                  <PreferenceRow
                    title="Idioma"
                    subtitle="Defina o idioma da plataforma."
                    control={<SelectField value="Português (Brasil)" icon={<span className="text-[18px]">🇧🇷</span>} />}
                  />
                  <PreferenceRow title="Fuso horário" subtitle="Defina o fuso horário da sua conta." control={<SelectField value="UTC - 03:00 - Brasília" />} />
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div className="border-b border-border py-8 last:border-b-0">
              <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
                <div>
                  <span className="inline-flex rounded-[12px] bg-muted px-3 py-2 text-[14px] font-semibold text-foreground">
                    Notificações
                  </span>
                </div>
                <div>
                  <PreferenceRow title="Notificações por Push" subtitle="Receba avisos diretamente no desktop ou smartphone." control={<Toggle checked />} />
                  <PreferenceRow title="Notificações por SMS" subtitle="Receba avisos importantes por mensagem de texto (SMS)." control={<Toggle checked />} />
                  <PreferenceRow title="Notificações por WhatsApp" subtitle="Receba notificações diretamente no WhatsApp para maior agilidade." control={<Toggle checked />} />
                  <PreferenceRow title="Notificações por E-mail" subtitle="Receba notificações no seu e-mail cadastrado." control={<Toggle checked />} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ━━━ SEGURANÇA ━━━ */}
        {activeSection === "seguranca" && (
          <>
            <div className="border-b border-border py-8">
              <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr]">
                <SectionHeading title="Acesso à Analiso" subtitle="Gerencie formas de acessar a Analiso" />
                <div className="space-y-3">
                  <SecurityActionRow title="Senha de acesso" subtitle="Atualize a senha usada para acessar sua conta." actionLabel="Alterar senha" />
                  <SecurityActionRow title="E-mail de acesso" subtitle="Atualize o e-mail utilizado para acessar sua conta." actionLabel="Alterar E-mail" />
                  <SecurityActionRow title="Autenticação de dois fatores" subtitle="Proteja sua conta com uma verificação adicional ao fazer login." actionLabel="Habilitar" />
                </div>
              </div>
            </div>

            <div className="py-8">
              <h2 className="text-[17px] font-semibold text-foreground">Dispositivos conectados</h2>

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
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-500 dark:bg-blue-900/20">
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
            </div>
          </>
        )}

        {/* ━━━ ASSINATURA ━━━ */}
        {activeSection === "assinatura" && (
          <section className="py-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-[560px]">
                <h2 className="text-[20px] font-semibold leading-[1.22] tracking-[-0.03em] text-foreground">
                  Flexibilidade e recursos sob medida para cada investidor
                </h2>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {activePlan
                    ? `Você está no plano ${activePlan.name}.`
                    : "Escolha o plano ideal para o seu perfil de investimento."}
                </p>
              </div>

              <div className="inline-flex items-center rounded-[18px] border border-border bg-muted p-1.5 shadow-[0_10px_22px_rgba(15,23,40,0.03)]">
                <button
                  onClick={() => setCycle("Mensal")}
                  className={`rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                    cycle === "Mensal"
                      ? "bg-card font-semibold text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.05)]"
                      : "text-muted-foreground"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setCycle("Anual")}
                  className={`rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                    cycle === "Anual"
                      ? "bg-card font-semibold text-foreground shadow-[0_6px_14px_rgba(15,23,40,0.05)]"
                      : "text-muted-foreground"
                  }`}
                >
                  Anual
                </button>
                {cycle === "Anual" && (
                  <span className="ml-2 rounded-[12px] bg-brand-surface px-3 py-2 text-[13px] font-semibold text-brand">
                    20%OFF
                  </span>
                )}
              </div>
            </div>

            {/* Active subscription banner */}
            {activePlan && subscription?.status === "active" && (() => {
              const pricingEntry = activePlan.pricing.find(p => p.billingCycle === subscription.billingCycle);
              const price = pricingEntry?.price ?? 0;
              const displayPrice = subscription.billingCycle === "anual" ? Math.round(price / 12) : price;
              const renewDate = subscription.renewsAt
                ? new Date(subscription.renewsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                : null;
              const startDate = new Date(subscription.startedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
              return (
                <div className="mt-7 rounded-[20px] border border-brand/25 bg-brand-surface/30 p-6 shadow-[0_12px_28px_rgba(18,165,148,0.06)]">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-brand text-white shadow-[0_8px_18px_rgba(18,165,148,0.22)]">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand">
                          Meu Plano
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <h3 className="text-[16px] font-semibold text-foreground">{activePlan.name}</h3>
                          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand">Ativo</span>
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                          {formatPriceCents(displayPrice)} /mês
                          {subscription.billingCycle === "anual" && (
                            <span className="ml-1 text-muted-foreground/60">
                              (total anual: {formatPriceCents(price)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancel}
                      disabled={loadingAction === "cancel"}
                      className="rounded-[11px] border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      {loadingAction === "cancel" ? "Cancelando…" : "Cancelar assinatura"}
                    </button>
                  </div>

                  {/* Separador */}
                  <div className="my-5 h-px bg-brand/15" />

                  {/* Grid 2x2 de detalhes */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Ciclo */}
                    <div className="rounded-[14px] border border-border/60 bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-medium">Ciclo</span>
                      </div>
                      <p className="mt-1.5 text-[14px] font-semibold text-foreground">
                        {subscription.billingCycle === "anual" ? "Anual" : "Mensal"}
                      </p>
                    </div>

                    {/* Início */}
                    <div className="rounded-[14px] border border-border/60 bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-medium">Começou a assinar em</span>
                      </div>
                      <p className="mt-1.5 text-[14px] font-semibold text-foreground">{startDate}</p>
                    </div>

                    {/* Renovação */}
                    <div className="rounded-[14px] border border-border/60 bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-medium">Renova em</span>
                      </div>
                      <p className="mt-1.5 text-[14px] font-semibold text-foreground">
                        {renewDate ?? "—"}
                      </p>
                    </div>

                    {/* Auto-renew */}
                    <div className="rounded-[14px] border border-border/60 bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-medium">Renovação automática</span>
                      </div>
                      <div className="mt-2.5">
                        <button
                          onClick={handleToggleAutoRenew}
                          disabled={loadingAction === "auto-renew"}
                          className={`relative flex h-6 w-10 items-center rounded-full p-1 transition ${
                            subscription.autoRenew ? "bg-brand" : "bg-muted-foreground/30"
                          }`}
                        >
                          {loadingAction === "auto-renew" ? (
                            <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-white" />
                          ) : (
                            <div
                              className={`h-4 w-4 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-transform ${
                                subscription.autoRenew ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:gap-4">
              {plans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan}
                  cycle={cycle}
                  currentPlanId={activePlanId}
                  currentBillingCycle={activeBillingCycle}
                  onSubscribe={handleSubscribe}
                  onCancel={handleCancel}
                  loading={
                    loadingAction === plan.id ||
                    (loadingAction === "cancel" && activePlanId === plan.id)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* ━━━ PAGAMENTO ━━━ */}
        {activeSection === "pagamento" && (
          <>
            <ProfileSection
              title="Método de pagamento"
              subtitle="Gerencie o cartão associado à sua assinatura"
              actionLabel="Editar pagamento"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-[16px] border border-border p-4">
                  <div className="flex h-10 w-16 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-600 to-blue-800">
                    <span className="text-[11px] font-bold text-white tracking-wider">VISA</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-foreground">Visa terminando em 4242</p>
                    <p className="text-[12px] text-muted-foreground">Expira em 12/2027</p>
                  </div>
                  <span className="rounded-full bg-success-surface px-3 py-1 text-[11px] font-semibold text-success-text">Ativo</span>
                </div>

                <div className="grid grid-cols-[220px_1fr] items-center gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-[13px]">Próxima cobrança</span>
                  </div>
                  <div className="text-[14px] font-medium text-foreground">R$ 39,00 em 15/04/2026</div>
                </div>

                <div className="grid grid-cols-[220px_1fr] items-center gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-[13px]">Endereço de cobrança</span>
                  </div>
                  <div className="text-[14px] font-medium text-foreground">Rua Augusta, 1234 — São Paulo, SP</div>
                </div>
              </div>
            </ProfileSection>

            <ProfileSection
              title="Histórico de cobranças"
              subtitle="Acompanhe suas faturas e comprovantes"
            >
              <div className="space-y-3">
                {[
                  { date: "15/03/2026", desc: "Plano Pro — Mensal", amount: "R$ 39,00", status: "Pago" },
                  { date: "15/02/2026", desc: "Plano Pro — Mensal", amount: "R$ 39,00", status: "Pago" },
                  { date: "15/01/2026", desc: "Plano Pro — Mensal", amount: "R$ 39,00", status: "Pago" },
                ].map((invoice) => (
                  <div
                    key={invoice.date}
                    className="flex items-center justify-between rounded-[14px] border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-muted">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{invoice.desc}</p>
                        <p className="text-[12px] text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[14px] font-medium text-foreground">{invoice.amount}</span>
                      <span className="rounded-full bg-success-surface px-3 py-1 text-[11px] font-semibold text-success-text">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ProfileSection>
          </>
        )}

        {/* ━━━ ALERTAS ━━━ */}
        {activeSection === "alertas" && (
          <section className="py-8">
            <ProfileSection title="Configurar alertas" subtitle="Defina quais tipos de alerta deseja receber e como.">
              <div className="space-y-5">
                {/* Categorias */}
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-foreground">Categorias de alerta</p>
                  {[
                    { label: "Risco", desc: "Alertas quando uma ação entrar em zona de risco" },
                    { label: "Atenção", desc: "Mudanças relevantes que pedem acompanhamento" },
                    { label: "Oportunidade", desc: "Ações que entraram em uma faixa de oportunidade" },
                    { label: "Dividendo", desc: "Datas de ex-dividendo e pagamentos próximos" },
                  ].map((cat) => (
                    <label key={cat.label} className="flex items-start gap-3 rounded-[14px] border border-border p-4 transition hover:bg-muted">
                      <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 rounded border-border accent-brand" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{cat.label}</p>
                        <p className="text-[12px] text-muted-foreground">{cat.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Canal de entrega */}
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-foreground">Canal de entrega</p>
                  {[
                    { label: "Push no navegador", desc: "Receba notificações em tempo real" },
                    { label: "E-mail diário", desc: "Resumo diário com todos os alertas do dia" },
                    { label: "E-mail em tempo real", desc: "Um e-mail para cada alerta importante" },
                  ].map((ch) => (
                    <label key={ch.label} className="flex items-start gap-3 rounded-[14px] border border-border p-4 transition hover:bg-muted">
                      <input type="checkbox" defaultChecked={ch.label === "Push no navegador"} className="mt-0.5 h-4 w-4 rounded border-border accent-brand" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{ch.label}</p>
                        <p className="text-[12px] text-muted-foreground">{ch.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <button className="inline-flex h-10 items-center rounded-[14px] bg-brand px-5 text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(18,165,148,0.18)] transition hover:bg-brand/90 active:scale-[0.98]">
                  Salvar preferências
                </button>
              </div>
            </ProfileSection>
          </section>
        )}
      </div>
      </div>{/* fim ilha */}
    </AccountShell>
  );
}
