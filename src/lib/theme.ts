/**
 * Sistema de theming multi-marca.
 *
 * Cada marca guarda un `BrandTheme` en la base (columna JSON). Estos tokens
 * se transforman en variables CSS y se inyectan en un contenedor, de modo que
 * TODO el diseño (botones, tarjetas, tipografías) se adapta a la marca/rubro
 * sin duplicar componentes.
 */

export type BrandTheme = {
  colors: {
    /** Fondo general */
    bg: string;
    /** Texto principal */
    fg: string;
    /** Color de marca principal (CTA, acentos fuertes) */
    primary: string;
    /** Texto sobre `primary` */
    primaryFg: string;
    /** Acento secundario / dorado / detalle fino */
    accent: string;
    /** Fondo de tarjetas/superficies */
    card: string;
    /** Texto atenuado */
    muted: string;
    /** Bordes sutiles */
    border: string;
  };
  fonts: {
    /** Tipografía de títulos (serif elegante por defecto) */
    heading: string;
    /** Tipografía de cuerpo (sans limpia) */
    body: string;
  };
  /** Radio de esquinas base */
  radius: string;
};

/** Theme por defecto: elegante, sobrio, atemporal (verde ecuestre + arena + dorado). */
export const DEFAULT_THEME: BrandTheme = {
  colors: {
    bg: "#faf8f4",
    fg: "#1c1a17",
    primary: "#1f3d2b", // verde bosque profundo
    primaryFg: "#f6f3ec",
    accent: "#b08d57", // dorado envejecido
    card: "#ffffff",
    muted: "#7a736a",
    border: "#e7e1d6",
  },
  fonts: {
    heading: "var(--font-heading)",
    body: "var(--font-body)",
  },
  radius: "0.25rem",
};

/** Presets listos para distintos rubros. Sirven de punto de partida en el admin. */
export const THEME_PRESETS: Record<string, { label: string; theme: BrandTheme }> = {
  ecuestre: {
    label: "Ecuestre / Polo (verde & dorado)",
    theme: DEFAULT_THEME,
  },
  noir: {
    label: "Lujo Noir (negro & champagne)",
    theme: {
      colors: {
        bg: "#0f0f10",
        fg: "#f2efe9",
        primary: "#c8a96a",
        primaryFg: "#141310",
        accent: "#c8a96a",
        card: "#1a1a1c",
        muted: "#9a948b",
        border: "#2a2a2d",
      },
      fonts: { heading: "var(--font-heading)", body: "var(--font-body)" },
      radius: "0rem",
    },
  },
  equipo: {
    label: "Sport / Equipamiento (azul marino)",
    theme: {
      colors: {
        bg: "#f5f7fa",
        fg: "#101827",
        primary: "#13293d",
        primaryFg: "#ffffff",
        accent: "#c0392b",
        card: "#ffffff",
        muted: "#64748b",
        border: "#e2e8f0",
      },
      fonts: { heading: "var(--font-heading)", body: "var(--font-body)" },
      radius: "0.5rem",
    },
  },
};

/** Convierte un theme (o parcial) en el conjunto de variables CSS a inyectar. */
export function themeToCssVars(
  theme?: Partial<BrandTheme> | null,
): Record<string, string> {
  const t: BrandTheme = {
    colors: { ...DEFAULT_THEME.colors, ...(theme?.colors ?? {}) },
    fonts: { ...DEFAULT_THEME.fonts, ...(theme?.fonts ?? {}) },
    radius: theme?.radius ?? DEFAULT_THEME.radius,
  };
  // Los nombres coinciden con los tokens definidos en globals.css (@theme),
  // por lo que overridear estas variables en un contenedor re-tematiza todo
  // el árbol de componentes que use utilidades como `bg-primary`, `rounded-brand`.
  return {
    "--color-bg": t.colors.bg,
    "--color-fg": t.colors.fg,
    "--color-primary": t.colors.primary,
    "--color-primary-fg": t.colors.primaryFg,
    "--color-accent": t.colors.accent,
    "--color-card": t.colors.card,
    "--color-muted": t.colors.muted,
    "--color-border": t.colors.border,
    "--radius-brand": t.radius,
  };
}
