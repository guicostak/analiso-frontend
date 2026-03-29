import { CreditCard, LogOut, Settings, User, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/AuthContext";

export function UserNavMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      <button
        onClick={() => setOpen((value) => !value)}
        className={`h-8 w-8 overflow-hidden rounded-full border bg-card transition-all focus:outline-none ${open ? "border-brand ring-2 ring-brand-surface" : "border-border-strong hover:opacity-90"}`}
        aria-label="Abrir menu do usuário"
      >
        {user?.picture ? (
          <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
        ) : (
          <UserCircle2 className="m-auto h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[332px] rounded-[20px] border border-border bg-card p-2.5 shadow-[0_20px_40px_rgba(15,23,40,0.14)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5 rounded-[14px] px-2 py-2">
            <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-card">
              {user?.picture ? (
                <img src={user.picture} alt={user.name ?? "Perfil"} className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="m-auto mt-2 h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">{user?.name ?? "Bianca"}</p>
              <p className="truncate text-[12px] text-muted-foreground">{user?.email ?? "bianca@clinicup.com.br"}</p>
            </div>
          </div>

          <div className="mt-2 space-y-0.5 px-0.5 py-1">
            <button
              onClick={() => navigateTo("/perfil")}
              className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-left text-[14px] text-foreground transition hover:bg-hover"
            >
              <User className="h-4.5 w-4.5 text-muted-foreground" />
              <span>Meu perfil</span>
            </button>

            <button
              onClick={() => navigateTo("/assinatura")}
              className="flex w-full items-center justify-between rounded-[11px] px-2.5 py-2 text-left text-[14px] text-foreground transition hover:bg-hover"
            >
              <span className="flex items-center gap-2.5">
                <CreditCard className="h-4.5 w-4.5 text-muted-foreground" />
                <span>Assinatura</span>
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">PRO</span>
            </button>

            <button className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-left text-[14px] text-foreground transition hover:bg-hover">
              <Settings className="h-4.5 w-4.5 text-muted-foreground" />
              <span>Configurações</span>
            </button>
          </div>

          <div className="mx-1.5 border-t border-border pt-2.5">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-left text-[14px] text-foreground transition hover:bg-hover"
            >
              <LogOut className="h-4.5 w-4.5 text-muted-foreground" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
