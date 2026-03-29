import Link from "next/link";

interface SidebarPlanCardProps {
  href?: string;
}

export function SidebarPlanCard({ href = "/assinatura" }: SidebarPlanCardProps) {
  return (
    <Link href={href} className="mt-auto block">
      <div className="rounded-[16px] border border-border bg-card p-3.5 shadow-[0_8px_20px_rgba(15,23,40,0.05)] transition hover:shadow-[0_12px_28px_rgba(15,23,40,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-foreground">Plano</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Renovação em 12/11</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-brand-surface px-2 py-0.5 text-[10px] font-semibold text-brand-text">
            PRO
          </span>
        </div>

        <span className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-[10px] bg-muted text-[11px] font-semibold text-foreground transition hover:bg-hover">
          Atualizar plano
        </span>
      </div>
    </Link>
  );
}
