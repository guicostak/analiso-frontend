import {
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  GitCompare,
  Home,
  LayoutGrid,
  NotebookPen,
  Users,
} from "lucide-react";
import Link from "next/link";
import logo from "@/src/assets/logos/logo.png";

interface SidebarProps {
  currentPage?: string;
}

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
      const className = `group relative grid h-10 w-10 place-items-center rounded-lg ${
        isActive
          ? "bg-brand-surface text-brand-text"
          : "text-muted-foreground hover:bg-hover hover:text-foreground"
      }`;

      if (item.href.startsWith("/")) {
        return (
          <Link key={item.id} href={item.href} className={className} title={item.label} aria-label={item.label}>
            <Icon className="h-[18px] w-[18px]" />
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
    <aside className="fixed left-0 top-0 z-30 h-screen w-[88px] border-r border-border bg-background">
      <div className="flex h-full flex-col items-center px-3 py-4">
        <img src={logo.src} alt="Analiso" className="h-11 w-11 object-contain" />

        <nav className="mt-5 flex w-full flex-col items-center gap-3">{renderItems(primaryItems)}</nav>

        <div className="my-4 h-px w-10 bg-border" />

        <nav className="flex w-full flex-col items-center gap-3">{renderItems(secondaryItems)}</nav>

        <div className="my-4 h-px w-10 bg-border" />

      </div>
    </aside>
  );
}
