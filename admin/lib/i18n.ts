// Locales gérées par le CMS. FR est canonique (fichiers à la racine des collections
// + profile.json) ; EN/ES/PT sont les traductions (sous-dossier `<lang>/` + profile.<lang>.json).
export const LANGS = ["fr", "en", "es", "pt"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "fr";
// Locales traduisibles depuis le FR (toutes sauf le canonique).
export const TRANSLATABLE: Lang[] = ["en", "es", "pt"];

export function parseLang(v: string | null | undefined): Lang {
  return v === "en" || v === "es" || v === "pt" ? v : "fr";
}
