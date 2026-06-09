// Locales gérées par le CMS. FR est canonique (fichiers à la racine des collections
// + profile.json) ; EN est la traduction (sous-dossier `en/` + profile.en.json).
export const LANGS = ["fr", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "fr";

export function parseLang(v: string | null | undefined): Lang {
  return v === "en" ? "en" : "fr";
}
