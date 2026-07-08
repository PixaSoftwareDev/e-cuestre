import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Jost, Inter } from "next/font/google";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/i18n-provider";
import { withBasePath } from "@/lib/base-path";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Ecuestre";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_DESCRIPTION =
  "Piezas de primera calidad para el mundo del polo y la vida ecuestre. Diseño fino, materiales nobles, hechas para durar.";
// Imagen para compartir en redes/WhatsApp (1200×630, recortada en Cloudinary).
const OG_IMAGE =
  "https://res.cloudinary.com/dukv3ov6t/image/upload/c_fill,w_1200,h_630/v1783296082/hawsrvxet7sy8odgi74m.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Equipamiento y estilo de alta gama`,
    template: `%s · ${siteName}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "polo",
    "ecuestre",
    "talabartería",
    "cuero",
    "equitación",
    "indumentaria ecuestre",
  ],
  openGraph: {
    type: "website",
    siteName,
    locale: "es_AR",
    title: `${siteName} — Equipamiento y estilo de alta gama`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${siteName} — polo y vida ecuestre`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Equipamiento y estilo de alta gama`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
  icons: {
    // Silueta negra en navegador claro, blanca en navegador oscuro.
    icon: [
      { url: withBasePath("/favicon-negro.png"), media: "(prefers-color-scheme: light)" },
      { url: withBasePath("/favicon-blanco.png"), media: "(prefers-color-scheme: dark)" },
    ],
    apple: withBasePath("/apple-icon.png"),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, cookieStore] = await Promise.all([getLocale(), cookies()]);
  // El tema se lee de una cookie y se aplica en el servidor: sin flash y sin
  // scripts inline (que chocan con las View Transitions).
  const isDark = cookieStore.get("theme")?.value === "dark";
  return (
    <html
      lang={locale}
      className={`${jost.variable} ${inter.variable} h-full antialiased${
        isDark ? " dark" : ""
      }`}
      // Extensiones de navegador (theme switchers) inyectan atributos en <html>
      // antes de la hidratación. Evita el falso warning de hydration mismatch.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
