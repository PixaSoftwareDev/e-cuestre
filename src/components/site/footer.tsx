import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PaymentMethods } from "@/components/site/payment-methods";
import { Logo } from "@/components/site/logo";

type FooterBrand = { slug: string; name: string };

export function Footer({
  brands,
  siteName,
}: {
  brands: FooterBrand[];
  siteName: string;
}) {
  const year = 2026;
  return (
    <footer className="mt-32 border-t border-border bg-card">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          {/* Marca */}
          <div>
            <Logo imgClassName="h-9" textClassName="text-2xl" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Equipamiento y objetos de primera para el mundo del polo y la vida
              ecuestre. Materiales nobles, oficio y diseño atemporal.
            </p>
          </div>

          {/* Marcas */}
          <div>
            <p className="kicker text-muted">Marcas</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/marca/${b.slug}`}
                    className="text-fg/80 transition-colors hover:text-primary"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <p className="kicker text-muted">Ayuda</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/productos" className="text-fg/80 transition-colors hover:text-primary">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-fg/80 transition-colors hover:text-primary">
                  Carrito
                </Link>
              </li>
              <li>
                <span className="text-fg/80">Envíos y devoluciones</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="kicker text-muted">Novedades</p>
            <p className="mt-4 text-sm text-muted">
              Sumate para conocer lanzamientos y ediciones limitadas.
            </p>
            {/* TODO: conectar a un servicio de email. Por ahora es visual. */}
            <form className="mt-4 flex items-center gap-2" action="#">
              <input
                type="email"
                required
                placeholder="Tu correo"
                aria-label="Correo para novedades"
                className="h-11 w-full rounded-brand border border-border bg-bg px-3 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none"
              />
              <button
                type="submit"
                aria-label="Suscribirse"
                className="sheen inline-flex h-11 shrink-0 items-center justify-center rounded-brand bg-primary px-4 text-primary-fg shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>

      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted md:flex-row">
          <p>
            © {year} {siteName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <span>Pagos seguros</span>
            <PaymentMethods size={24} />
          </div>
        </div>
      </div>
    </footer>
  );
}
