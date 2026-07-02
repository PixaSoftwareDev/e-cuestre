import type { Metadata } from "next";
import { Jost, Inter } from "next/font/google";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/i18n-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Equipamiento y estilo de alta gama`,
    template: `%s · ${siteName}`,
  },
  description:
    "Piezas de primera calidad para el mundo del polo y la vida ecuestre. Diseño fino, materiales nobles, hechas para durar.",
  openGraph: {
    type: "website",
    siteName,
    locale: "es_AR",
  },
  robots: { index: true, follow: true },
  icons: {
    // Silueta negra en navegador claro, blanca en navegador oscuro.
    icon: [
      { url: "/favicon-negro.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-blanco.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${jost.variable} ${inter.variable} h-full antialiased`}
      // Extensiones de navegador (theme switchers) inyectan atributos en <html>
      // antes de la hidratación. Evita el falso warning de hydration mismatch.
      suppressHydrationWarning
    >
      <head>
        {/*
          Aplica el modo claro/oscuro antes del primer paint para evitar flash.
          Lee la preferencia guardada o, si no hay, la del sistema operativo.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
