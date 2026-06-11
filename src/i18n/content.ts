// Contenu multilingue par sous-dossier de locale : `slug.mdx` (FR canonique, à la
// racine de la collection) + `en/slug.mdx`, `es/slug.mdx`, `pt/slug.mdx`. L'id de
// collection Astro vaut "slug" (FR) ou "<lang>/slug" — le séparateur `/` survit à la
// slugification. On dérive la langue et le slug de base, et on sélectionne l'entrée de
// la locale demandée avec repli FR.

import { defaultLang, type Lang } from "./ui";

// Locales stockées dans un sous-dossier (toutes sauf le FR canonique).
const PREFIXED: Lang[] = ["en", "es", "pt"];

export function entryLang(id: string): Lang {
  for (const l of PREFIXED) {
    if (id.startsWith(`${l}/`)) return l;
  }
  return defaultLang;
}

export function baseSlug(id: string): string {
  return id.replace(/^(en|es|pt)\//, "");
}

interface HasId {
  id: string;
}

// Pour chaque slug de base (présent en FR), renvoie l'entrée de la locale demandée si
// elle existe, sinon l'entrée FR. Le slug exposé est toujours le slug de base → URLs
// propres identiques entre locales (/projects/x, /en/projects/x, /es/projects/x…).
export function entriesForLang<T extends HasId>(all: T[], lang: Lang): { slug: string; entry: T }[] {
  const byBase = new Map<string, Partial<Record<Lang, T>>>();

  for (const entry of all) {
    const slug = baseSlug(entry.id);
    const group = byBase.get(slug) ?? {};
    group[entryLang(entry.id)] = entry;
    byBase.set(slug, group);
  }

  const out: { slug: string; entry: T }[] = [];
  for (const [slug, group] of byBase) {
    const frEntry = group[defaultLang];
    if (!frEntry) continue; // pas de FR canonique : on n'expose pas
    out.push({ slug, entry: lang === defaultLang ? frEntry : group[lang] ?? frEntry });
  }
  return out;
}
