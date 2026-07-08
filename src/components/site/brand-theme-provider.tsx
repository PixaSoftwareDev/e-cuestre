import * as React from "react";
import { themeToCssVars, type BrandTheme } from "@/lib/theme";

/**
 * Envuelve una sección con el theme de una marca.
 *
 * - Colores de **identidad** (primary, accent, primaryFg, radius): se aplican
 *   siempre, como estilo inline (identidad de marca en claro y en oscuro).
 * - Colores **estructurales** (fondo, texto, tarjetas, bordes, muted): se
 *   aplican SOLO en modo claro. En modo oscuro los maneja `html.dark` (global),
 *   así el dark funciona aunque la marca tenga un fondo claro.
 *
 * Server Component: cero JS en el cliente.
 */

const STRUCTURAL = [
  "--color-bg",
  "--color-fg",
  "--color-card",
  "--color-muted",
  "--color-border",
] as const;

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

  // Identidad: siempre (inline gana sobre todo, incluso en dark).
  const identity: Record<string, string> = {
    "--color-primary": vars["--color-primary"],
    "--color-primary-fg": vars["--color-primary-fg"],
    "--color-accent": vars["--color-accent"],
    "--radius-brand": vars["--radius-brand"],
  };

  // Estructurales: solo en claro, vía una clase scopeada.
  const structuralCss = STRUCTURAL.map((k) => `${k}:${vars[k]}`).join(";");
  const seed = STRUCTURAL.map((k) => vars[k]).join("");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  const cls = `brand-${(h >>> 0).toString(36)}`;
  const css = `html:not(.dark) .${cls}{${structuralCss}}`;

  return (
    <Tag
      style={identity as React.CSSProperties}
      // `bg-bg text-fg` fijan fondo y texto a las vars de la marca, juntos: sin
      // el fondo, un theme oscuro deja texto claro sobre fondo claro (ilegible);
      // sin el texto, hereda el fg global y no contrasta con el fondo de marca.
      className={`${cls} bg-bg text-fg${className ? ` ${className}` : ""}`}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </Tag>
  );
}
