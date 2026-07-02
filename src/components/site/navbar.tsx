"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartButton } from "@/components/cart/cart-button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { FavoritesNavButton } from "@/components/site/favorites-nav-button";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { useSearch } from "@/store/search";

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
          ? "nav-overlay absolute inset-x-0 top-0 bg-gradient-to-b from-black/35 to-transparent text-white"
          : "relative bg-bg",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Izquierda: menú móvil + links desktop */}
        <div className="flex items-center gap-1 md:gap-6">
          <button
            className="nav-icon inline-flex h-11 w-11 items-center justify-center md:hidden"
            aria-label="Menú"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/productos" className={linkClass}>
              Tienda
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
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
        >
          {overlay ? (
            <Image
              src="/logo-blanco.png"
              alt=""
              width={60}
              height={57}
              sizes="60px"
              priority
              className="h-10 w-auto md:h-12"
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
                className="h-10 w-auto md:h-12 dark:hidden"
              />
              <Image
                src="/logo-blanco.png"
                alt=""
                width={60}
                height={57}
                sizes="60px"
                priority
                className="hidden h-10 w-auto md:h-12 dark:block"
              />
            </>
          )}
          <span className="font-heading text-xl tracking-tight md:text-2xl">
            <span className="text-accent">E</span>
            <span className="mx-[0.12em] text-accent">-</span>
            <span className={overlay ? "text-white" : "text-fg"}>cuestre</span>
          </span>
        </Link>

        {/* Derecha: buscar + tema + carrito */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => openSearch(true)}
            aria-label="Buscar"
            className="nav-icon inline-flex h-11 w-11 items-center justify-center"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <FavoritesNavButton />
          <ThemeToggle />
          <LanguageSwitcher />
          <CartButton />
        </div>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-bg md:hidden">
          <div className="container-page flex h-16 items-center justify-between">
            <span className="font-heading text-xl">{siteName}</span>
            <button
              className="nav-icon inline-flex h-11 w-11 items-center justify-center"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="container-page flex flex-col gap-1 pt-6">
            <Link
              href="/productos"
              onClick={() => setMenuOpen(false)}
              className="border-b border-border py-4 font-heading text-2xl"
            >
              Tienda
            </Link>
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/marca/${b.slug}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-4 font-heading text-2xl"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
