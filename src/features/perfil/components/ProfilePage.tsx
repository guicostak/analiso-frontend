"use client";

import {
  BriefcaseBusiness,
  FileText,
  Mail,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/src/features/auth/AuthContext";
import { AccountShell } from "./AccountShell";

type AccountField = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

const personalFields: AccountField[] = [
  { icon: User, label: "Nome completo", value: "Bianca Mendes" },
  { icon: Phone, label: "Telefone", value: "+55 (11) 9 9342-4523" },
  { icon: Mail, label: "E-mail", value: "bianca@gmail.com" },
  { icon: FileText, label: "CPF", value: "115.432.423-43" },
  { icon: Users, label: "Gênero", value: "Feminino" },
];

const professionalFields: AccountField[] = [
  { icon: BriefcaseBusiness, label: "Conselho", value: "CRP" },
  { icon: FileText, label: "Registro", value: "06/123456" },
  { icon: BriefcaseBusiness, label: "UF", value: "SP" },
  { icon: BriefcaseBusiness, label: "Profissão", value: "Psicóloga" },
  { icon: FileText, label: "C.B.O", value: "2515-10 – Psicólogo clínico" },
  { icon: Shield, label: "RQE", value: "--" },
];

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
    <section className="border-b border-[#EEF2F6] py-8 last:border-b-0">
      <div className="grid gap-7 xl:grid-cols-[0.9fr_1.2fr_auto]">
        <div>
          <h2 className="text-[17px] font-semibold text-[#171717]">{title}</h2>
          <p className="mt-2 text-[13px] text-[#8A8A8A]">{subtitle}</p>
        </div>

        <div>{children}</div>

        {actionLabel ? (
          <div className="flex xl:justify-end">
            <button className="inline-flex h-10 items-center justify-center rounded-[15px] border border-[#E8E8E8] bg-white px-4.5 text-[14px] font-semibold text-[#171717] shadow-[0_8px_18px_rgba(15,23,40,0.05)]">
              {actionLabel}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FieldList({ fields }: { fields: AccountField[] }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div key={field.label} className="grid grid-cols-[220px_1fr] items-center gap-4">
            <div className="flex items-center gap-3 text-[#8A8A8A]">
              <Icon className="h-4 w-4" />
              <span className="text-[13px]">{field.label}</span>
            </div>
            <div className="text-[14px] font-medium text-[#171717]">{field.value}</div>
          </div>
        );
      })}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <AccountShell activeTab="conta">
      <ProfileSection title="Foto de perfil" subtitle="Atualize sua foto de perfil">
        <div className="flex flex-col items-start gap-4">
          <div className="h-[52px] w-[52px] overflow-hidden rounded-[16px] border border-[#E7EEF5] bg-white">
            {user?.picture ? (
              <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#171717]">Envie a foto</p>
            <p className="mt-1 text-[14px] text-[#8A8A8A]">JPG ou PNG · até 1 MB · até 250×250 px</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center rounded-[15px] border border-[#E8E8E8] bg-white px-4.5 text-[14px] font-semibold text-[#171717] shadow-[0_8px_18px_rgba(15,23,40,0.05)]">
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
      </ProfileSection>

      <ProfileSection
        title="Informações profissionais"
        subtitle="Edite suas informações profissionais"
        actionLabel="Editar informações"
      >
        <FieldList fields={professionalFields} />
      </ProfileSection>
    </AccountShell>
  );
}
