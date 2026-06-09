// Contenu bilingue par sous-dossier de locale : `slug.mdx` (FR canonique, à la
// racine de la collection) + `en/slug.mdx` (EN). L'id de collection Astro vaut
// "slug" (FR) ou "en/slug" (EN) — le séparateur `/` survit à la slugification,
// contrairement à un suffixe `.en`. On dérive la langue et le slug de base, et on
// sélectionne l'entrée de la locale avec fallback FR.

import { defaultLang, type Lang } from "./ui";

export function entryLang(id: string): Lang {
  return id.startsWith("en/") ? "en" : defaultLang;
}

export function baseSlug(id: string): string {
  return id.replace(/^en\//, "");
}

interface HasId {
  id: string;
}

// Pour chaque slug de base, renvoie l'entrée de la locale demandée si elle existe,
// sinon l'entrée FR (le site EN n'est jamais cassé). Le slug exposé est toujours le
// slug de base → URLs propres identiques entre locales (/projects/x et /en/projects/x).
export function entriesForLang<T extends HasId>(all: T[], lang: Lang): { slug: string; entry: T }[] {
  const fr = new Map<string, T>();
  const translated = new Map<string, T>();

  for (const entry of all) {
    const slug = baseSlug(entry.id);
    (entryLang(entry.id) === defaultLang ? fr : translated).set(slug, entry);
  }

  return [...fr.entries()].map(([slug, frEntry]) => ({
    slug,
    entry: lang === defaultLang ? frEntry : translated.get(slug) ?? frEntry,
  }));
}
