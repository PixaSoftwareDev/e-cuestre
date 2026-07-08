import * as React from "react";
import { themeToCssVars, type BrandTheme } from "@/lib/theme";

/**
 * Aplica la IDENTIDAD de una marca como variables CSS inline: color primario
 * (CTA), acento, texto sobre primario y radio de esquinas.
 *
 * El fondo y el texto NO se tocan: los controla el modo claro/oscuro global del
 * sitio. Así el theme de marca es coherente en ambos modos y en todo el sitio
 * (navbar incluido), sin riesgos de contraste. La marca se distingue por su
 * acento, tipografía, cantos, logo y fotos — no por invertir el fondo.
 *
 * Server Component: cero JS en el cliente.
 */
export function BrandThemeProvider({
  theme,
  className,
  children,
  as: Tag = "div",
}: {
  theme?: Partial<BrandTheme> | null;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  const vars = themeToCssVars(theme);

  const identity: Record<string, string> = {
    "--color-primary": vars["--color-primary"],
    "--color-primary-fg": vars["--color-primary-fg"],
    "--color-accent": vars["--color-accent"],
    "--radius-brand": vars["--radius-brand"],
  };

  return (
    <Tag style={identity as React.CSSProperties} className={className}>
      {children}
    </Tag>
  );
}
