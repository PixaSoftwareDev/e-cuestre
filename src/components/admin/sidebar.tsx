"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  BarChart3,
  Video,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/auth-actions";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/ordenes", label: "Órdenes", icon: ShoppingCart },
  { href: "/admin/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/admin/grabaciones", label: "Grabaciones", icon: Video },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-6 py-6">
        <Link href="/admin" className="font-heading text-xl">
          Ecuestre
        </Link>
        <p className="mt-0.5 text-xs text-muted">Administración</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-brand px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-fg"
                  : "text-fg/80 hover:bg-fg/5",
              )}
            >
              <l.icon className="h-4 w-4" strokeWidth={1.75} />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-brand px-3 py-2 text-sm text-fg/80 hover:bg-fg/5"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} /> Ver tienda
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-brand px-3 py-2 text-sm text-fg/80 hover:bg-fg/5"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} /> Salir
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-muted">{email}</p>
      </div>
    </aside>
  );
}
