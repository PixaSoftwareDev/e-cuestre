/** Países con su prefijo telefónico (para el checkout). */
export type Country = { code: string; name: string; dial: string };

export const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BR", name: "Brasil", dial: "+55" },
  { code: "PE", name: "Perú", dial: "+51" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "MX", name: "México", dial: "+52" },
  { code: "US", name: "Estados Unidos", dial: "+1" },
  { code: "ES", name: "España", dial: "+34" },
  { code: "IT", name: "Italia", dial: "+39" },
  { code: "FR", name: "Francia", dial: "+33" },
  { code: "DE", name: "Alemania", dial: "+49" },
  { code: "GB", name: "Reino Unido", dial: "+44" },
];

export const DEFAULT_COUNTRY = "AR";

export function findCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
