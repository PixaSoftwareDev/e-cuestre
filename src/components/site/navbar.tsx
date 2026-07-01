"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CartButton } from "@/components/cart/cart-button";

type NavBrand = { slug: string; name: string };

export function Navbar({
  brands,
  siteName,
}: {
  brands: NavBrand[];
  siteName: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 ease-[var(--ease-smooth)]",
        scrolled
          ? "border-b border-border bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Izquierda: menú móvil + links desktop */}
        <div className="flex items-center gap-1 md:gap-6">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-brand hover:bg-fg/5 md:hidden"
            aria-label="Menú"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/productos" className="text-sm hover:text-primary transition-colors">
              Tienda
            </Link>
            {brands.slice(0, 4).map((b) => (
              <Link
                key={b.slug}
                href={`/marca/${b.slug}`}
                className="text-sm hover:text-primary transition-colors"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Centro: logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-heading text-xl tracking-tight md:text-2xl"
        >
          {siteName}
        </Link>

        {/* Derecha: buscar + carrito */}
        <div className="flex items-center gap-1">
          <Link
            href="/productos"
            aria-label="Buscar"
            className="hidden h-11 w-11 items-center justify-center rounded-brand hover:bg-fg/5 md:inline-flex"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <CartButton />
        </div>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-bg md:hidden">
          <div className="container-page flex h-16 items-center justify-between">
            <span className="font-heading text-xl">{siteName}</span>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-brand hover:bg-fg/5"
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
