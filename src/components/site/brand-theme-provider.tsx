import * as React from "react";
import { themeToCssVars, type BrandTheme } from "@/lib/theme";

/**
 * Envuelve una sección con el theme de una marca. Al inyectar las variables
 * CSS como estilo inline, todos los componentes descendientes que usen
 * utilidades tematizadas (bg-primary, text-accent, rounded-brand...) se
 * re-tematizan automáticamente. Server Component: cero JS en el cliente.
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
  return (
    <Tag style={vars as React.CSSProperties} className={className}>
      {children}
    </Tag>
  );
}
