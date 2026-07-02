import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PaymentMethods } from "@/components/site/payment-methods";
import { Logo } from "@/components/site/logo";
import { getT } from "@/lib/i18n/server";

type FooterBrand = { slug: string; name: string };

export async function Footer({
  brands,
  siteName,
}: {
  brands: FooterBrand[];
  siteName: string;
}) {
  const year = 2026;
  const t = await getT();
  return (
    <footer className="mt-20 border-t border-border bg-card md:mt-32">
      <div className="container-page py-12 md:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-[1.6fr_1fr_1fr_1.4fr] md:gap-12">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <Logo imgClassName="h-9" textClassName="text-2xl" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Marcas */}
          <div>
            <p className="kicker text-muted">{t("footer.brands")}</p>
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
            <p className="kicker text-muted">{t("footer.help")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/productos" className="text-fg/80 transition-colors hover:text-primary">
                  {t("footer.catalog")}
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-fg/80 transition-colors hover:text-primary">
                  {t("footer.cart")}
                </Link>
              </li>
              <li>
                <span className="text-fg/80">{t("footer.shipping")}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <p className="kicker text-muted">{t("footer.newsletter")}</p>
            <p className="mt-4 text-sm text-muted">
              {t("footer.newsletterDesc")}
            </p>
            {/* TODO: conectar a un servicio de email. Por ahora es visual. */}
            <form className="mt-4 flex items-center gap-2" action="#">
              <input
                type="email"
                required
                placeholder={t("footer.emailPlaceholder")}
                aria-label={t("footer.emailPlaceholder")}
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
            © {year} {siteName}. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-3">
            <span>{t("footer.securePayments")}</span>
            <PaymentMethods size={24} />
          </div>
        </div>
      </div>
    </footer>
  );
}
