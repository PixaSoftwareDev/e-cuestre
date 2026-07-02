import "server-only";
import { cookies } from "next/headers";
import {
  LOCALES,
  DEFAULT_LOCALE,
  createTranslator,
  type Locale,
} from "./dictionaries";

/** Idioma actual, leído de la cookie `lang` (server components). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get("lang")?.value as Locale | undefined;
  return v && LOCALES.includes(v) ? v : DEFAULT_LOCALE;
}

/** Traductor para usar en server components: `const t = await getT()`. */
export async function getT() {
  return createTranslator(await getLocale());
}
