import { Bell, CreditCard, Lock, LogOut, User, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/features/auth/AuthContext";
import type { ComponentType } from "react";

export function UserNavMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const isOnProfile = pathname?.startsWith("/perfil");
  const activeTab = isOnProfile ? (searchParams?.get("tab") ?? "conta") : null;

  const menuItems: { id: string; label: string; href: string; icon: ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: "conta",        label: "Minha conta",   href: "/perfil",                  icon: User },
    { id: "seguranca",    label: "Segurança",      href: "/perfil?tab=seguranca",    icon: Lock },
    { id: "assinatura",   label: "Assinatura",     href: "/perfil?tab=assinatura",   icon: CreditCard, badge: "PRO" },
    { id: "alertas",      label: "Alertas",        href: "/perfil?tab=alertas",      icon: Bell },
  ];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={rootRef} className="relative ml-1">
      {/* Avatar button — com borda embaixo quando na aba perfil */}
      <button
        onClick={() => setOpen((value) => !value)}
        className={`relative h-8 w-8 overflow-hidden rounded-full border bg-card transition-[border-color,box-shadow,opacity] duration-150 ease-[var(--ease-out)] focus:outline-none ${open ? "border-brand ring-2 ring-brand-surface" : isOnProfile ? "border-brand" : "border-border-strong hover:opacity-90"}`}
        aria-label="Abrir menu do usuário"
      >
        {user?.picture ? (
          <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
        ) : (
          <UserCircle2 className="m-auto h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {/* Indicador de aba ativa — borda embaixo do ícone */}
      {isOnProfile && (
        <span className="absolute -bottom-2.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand" />
      )}

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] rounded-[18px] border border-border bg-card p-2 shadow-[0_20px_40px_rgba(15,23,40,0.14)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-in fade-in-0 zoom-in-[0.97] slide-in-from-top-1 duration-150 ease-[var(--ease-out)] origin-top-right">
          <div className="flex items-center gap-2.5 rounded-[12px] px-2.5 py-2">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-card">
              {user?.picture ? (
                <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="m-auto mt-1.5 h-4.5 w-4.5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">{user?.name ?? "Bianca"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email ?? "bianca@clinicup.com.br"}</p>
            </div>
          </div>

          <div className="mt-1 space-y-0.5 px-0.5 py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.href)}
                  className={`flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-foreground transition-[background-color] duration-150 ease-[var(--ease-out)] ${
                    isActive ? "bg-brand-surface" : "hover:bg-hover"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-1">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-b-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition-[background-color] duration-150 ease-[var(--ease-out)] text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
