/**
 * Prefijo de la app cuando se sirve bajo un subpath (ej. /ecuestre detrás de
 * Nginx). Se define con NEXT_PUBLIC_BASE_PATH en build-time; vacío en local.
 *
 * Necesario porque con `images.unoptimized` next/image no antepone el basePath
 * a los assets locales, y los fetch a rutas absolutas (`/api/...`) tampoco.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Antepone el basePath a una ruta absoluta del sitio (asset o API). */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
