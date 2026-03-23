import Link from "next/link";

interface SidebarPlanCardProps {
  href?: string;
}

export function SidebarPlanCard({ href = "/assinatura" }: SidebarPlanCardProps) {
  return (
    <Link href={href} className="mt-auto block pt-6">
      <div className="rounded-[20px] border border-[#E7EEF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFE_100%)] p-4 shadow-[0_14px_30px_rgba(15,23,40,0.05)] transition hover:shadow-[0_18px_36px_rgba(15,23,40,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-[#0F1728]">Plano</p>
            <p className="mt-1 text-[12px] text-[#667085]">Renovação em 12/11</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#EEF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#3965B8]">
            PRO
          </span>
        </div>

        <span className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[14px] bg-[#F3F4F6] text-[13px] font-semibold text-[#111827] transition hover:bg-[#EDEFF3]">
          Atualizar plano
        </span>
      </div>

      <div className="mt-5 space-y-1 text-[11px] leading-5 text-[#98A2B3]">
        <p>Todos direitos reservado</p>
        <p>Analiso - ©2025</p>
      </div>
    </Link>
  );
}
