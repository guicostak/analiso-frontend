import {
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  GitCompare,
  Home,
  LayoutGrid,
  NotebookPen,
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import logo from "../../assets/logos/logo.png";

interface SidebarProps {
  currentPage?: string;
}

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: any;
};

export function Sidebar({ currentPage = "dashboard" }: SidebarProps) {
  const primaryItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "explorar", label: "Explorar", icon: Compass, href: "/explorar" },
    { id: "watchlist", label: "Watchlist", icon: LayoutGrid, href: "/watchlist" },
    { id: "comparar", label: "Comparar", icon: GitCompare, href: "/comparar" },
  ];

  const secondaryItems: SidebarItem[] = [
    { id: "agenda", label: "Agenda", icon: CalendarDays, href: "#" },
    { id: "notas", label: "Notas", icon: NotebookPen, href: "#" },
    { id: "empresas", label: "Empresas", icon: Building2, href: "#" },
    { id: "time", label: "Time", icon: Users, href: "#" },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, href: "#" },
  ];

  const renderItems = (items: SidebarItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = currentPage === item.id;
      const className = `group relative grid h-10 w-10 place-items-center rounded-xl border transition-colors ${
        isActive
          ? "border-brand-border bg-brand-surface text-brand-text"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-hover hover:text-foreground"
      }`;

      if (item.href.startsWith("/")) {
        return (
          <Link key={item.id} href={item.href} className={className} title={item.label} aria-label={item.label}>
            <Icon className="h-[18px] w-[18px]" />
            {isActive ? <span className="pointer-events-none absolute -right-[14px] h-1.5 w-1.5 rounded-full bg-mint-500" /> : null}
          </Link>
        );
      }

      return (
        <button key={item.id} className={className} title={item.label} aria-label={item.label}>
          <Icon className="h-[18px] w-[18px]" />
        </button>
      );
    });

  return (
    <aside className="dash-side fixed left-0 top-0 z-30 h-screen w-[88px] border-r border-border bg-background">
      <div className="flex h-full flex-col items-center px-3 py-4">
        <img src={logo.src} alt="Analiso" className="h-11 w-11 object-contain" />

        <nav className="mt-5 flex w-full flex-col items-center gap-3">{renderItems(primaryItems)}</nav>

        <div className="my-4 h-px w-10 bg-border" />

        <nav className="flex w-full flex-col items-center gap-3">{renderItems(secondaryItems)}</nav>

        <div className="my-4 h-px w-10 bg-border" />

        <div className="mt-auto">
          <button
            title="Perfil"
            aria-label="Perfil"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <UserCircle2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
