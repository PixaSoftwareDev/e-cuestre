"use client";

import { createContext, useContext } from "react";
import { createTranslator, type Locale } from "@/lib/i18n/dictionaries";

const I18nContext = createContext<{
  t: (key: string) => string;
  locale: Locale;
}>({ t: (k) => k, locale: "es" });

/** Provee la función de traducción a los componentes cliente. */
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ t: createTranslator(locale), locale }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Hook de traducción para componentes cliente. */
export function useI18n() {
  return useContext(I18nContext);
}
export const useT = () => useContext(I18nContext).t;
