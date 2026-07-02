"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CartButton } from "@/components/cart/cart-button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { FavoritesNavButton } from "@/components/site/favorites-nav-button";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { MenuToggle } from "@/components/site/menu-toggle";
import { useSearch } from "@/store/search";
import { useT } from "@/components/i18n-provider";

type NavBrand = { slug: string; name: string };

export function Navbar({
  brands,
  siteName,
}: {
  brands: NavBrand[];
  siteName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const openSearch = useSearch((s) => s.setOpen);
  const t = useT();

  // En páginas con hero (home y marca) el navbar flota transparente encima;
  // en el resto es una barra sólida. No es fijo: se va con el scroll.
  const overlay = pathname === "/" || pathname.startsWith("/marca/");

  const linkClass = cn(
    "text-sm transition-colors",
    overlay ? "text-white/90 hover:text-white" : "hover:text-primary",
  );

  return (
    <header
      className={cn(
        "z-40",
        overlay
          ? "nav-overlay absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pb-4 text-white"
          : "relative bg-bg",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Izquierda: menú móvil + links desktop */}
        <div className="flex items-center gap-1 md:gap-6">
          <MenuToggle
            open={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              menuOpen
                ? "text-fg"
                : overlay
                  ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                  : "text-fg",
            )}
          />
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/productos" className={linkClass}>
              {t("nav.store")}
            </Link>
            {brands.slice(0, 4).map((b) => (
              <Link key={b.slug} href={`/marca/${b.slug}`} className={linkClass}>
                {b.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Centro: logo + nombre */}
        <Link
          href="/"
          aria-label={siteName}
          className="group absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
        >
          {overlay ? (
            <Image
              src="/logo-blanco.png"
              alt=""
              width={60}
              height={57}
              sizes="60px"
              priority
              className="h-10 w-auto md:h-12 transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-110"
            />
          ) : (
            <>
              <Image
                src="/logo-negro.png"
                alt=""
                width={60}
                height={57}
                sizes="60px"
                priority
                className="h-10 w-auto md:h-12 transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-110 dark:hidden"
              />
              <Image
                src="/logo-blanco.png"
                alt=""
                width={60}
                height={57}
                sizes="60px"
                priority
                className="hidden h-10 w-auto md:h-12 transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-110 dark:block"
              />
            </>
          )}
          <span className="font-heading text-xl tracking-tight md:text-2xl">
            <span className="text-accent">E</span>
            <span className="mx-[0.12em] text-accent">-</span>
            <span className={overlay ? "text-white" : "text-fg"}>cuestre</span>
          </span>
        </Link>

        {/* Derecha: en móvil solo buscar + carrito; el resto va al menú */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => openSearch(true)}
            aria-label={t("nav.search")}
            className="nav-icon inline-flex h-11 w-11 items-center justify-center"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="hidden items-center gap-1 md:flex">
            <FavoritesNavButton />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <CartButton />
        </div>
      </nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-bg pt-[4.5rem] md:hidden"
          >
            <div className="container-page flex flex-1 flex-col gap-1 overflow-y-auto pt-2">
              {[
                { href: "/productos", label: t("nav.store") },
                ...brands.map((b) => ({ href: `/marca/${b.slug}`, label: b.name })),
                { href: "/favoritos", label: t("nav.favorites") },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.05,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-border py-4 font-heading text-2xl transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Tema + idioma abajo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="container-page flex items-center justify-between border-t border-border py-4"
            >
              <span className="text-sm text-muted">{t("nav.preferences")}</span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <LanguageSwitcher up />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
