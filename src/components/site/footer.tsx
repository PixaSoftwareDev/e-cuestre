import Link from "next/link";

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
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-heading text-2xl">{siteName}</h3>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Equipamiento y objetos de primera para el mundo del polo y la vida
            ecuestre. Materiales nobles, oficio y diseño atemporal.
          </p>
        </div>
        <div>
          <p className="kicker text-muted">Marcas</p>
          <ul className="mt-4 space-y-2 text-sm">
            {brands.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/marca/${b.slug}`}
                  className="text-fg/80 hover:text-primary transition-colors"
                >
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-muted">Ayuda</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/productos" className="text-fg/80 hover:text-primary">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="text-fg/80 hover:text-primary">
                Carrito
              </Link>
            </li>
            <li>
              <span className="text-fg/80">Envíos y devoluciones</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted md:flex-row">
          <p>
            © {year} {siteName}. Todos los derechos reservados.
          </p>
          <p>Pagos seguros procesados por PayPal.</p>
        </div>
      </div>
    </footer>
  );
}
