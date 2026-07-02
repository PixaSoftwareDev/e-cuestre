"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Star,
  BarChart3,
  Video,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/auth-actions";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Logo } from "@/components/site/logo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/ordenes", label: "Órdenes", icon: ShoppingCart },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/admin/grabaciones", label: "Grabaciones", icon: Video },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-6 py-6">
        <Link href="/admin" className="inline-flex">
          <Logo imgClassName="h-8" textClassName="text-xl" />
        </Link>
        <p className="mt-1 kicker text-muted">Administración</p>
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
                "group relative flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm transition-colors",
                active
                  ? "font-medium text-primary"
                  : "text-fg/70 hover:bg-fg/5 hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-active"
                  className="absolute inset-0 -z-0 rounded-brand bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <l.icon
                className="relative z-10 h-[18px] w-[18px]"
                strokeWidth={1.75}
              />
              <span className="relative z-10">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm text-fg/70 transition-colors hover:bg-fg/5 hover:text-fg"
        >
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.75} /> Ver
          tienda
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-brand px-3 py-2.5 text-sm text-fg/70 transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} /> Salir
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border px-3 pt-3">
          <p className="min-w-0 flex-1 truncate text-xs text-muted">{email}</p>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
