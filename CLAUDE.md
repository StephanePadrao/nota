# Nota — Site personnel de Stéphane Padrao

Site Astro 6 statique déployé sur `https://spadrao.erro.cloud`.

## Stack

- **Framework** : Astro 6.2 (`output: "static"`)
- **UI** : React (composants interactifs), TailwindCSS v4, shadcn/ui
- **Contenu** : MDX dans `src/content/blog/`
- **Données** : tout dans `src/data/resume.tsx` (CV, skills, navbar) + `src/data/config.ts` (thème, couleurs, URL)
- **Fonts** : Outfit Variable (sans-serif), Geist Mono (code)
- **Thème** : amber — `oklch(0.52 0.17 55)` light / `oklch(0.74 0.16 55)` dark

## Internationalisation (FR / EN)

Site bilingue, **FR par défaut** (i18n natif Astro, sans librairie).

- **URLs** : FR à la racine (`/projects`, `/photos`…), EN préfixé `/en/...` (`prefixDefaultLocale: false` dans `astro.config.mjs`). Aucune URL FR n'a changé.
- **Chaînes UI** : `src/i18n/ui.ts` — dictionnaire `{ fr, en }` (le type `Strings` force l'EN à refléter le FR) + helpers `useTranslations(lang)`, `localizeHref`, `stripLangPrefix`, `localeUrl`.
- **CV / profil** : `src/data/resume.tsx` exporte `buildData(lang)` (assemble depuis `profile.json` **ou** `profile.en.json`, chargé en `import.meta.glob` optionnel → repli FR si absent). Les îlots React reçoivent `locale` (string) et appellent `buildData` **eux-mêmes** : les icônes (composants React) ne sont pas sérialisables à travers la frontière Astro→island.
- **Contenu** : chaque collection a une version EN dans un sous-dossier `en/`. FR = `src/content/projects/<slug>.mdx`, EN = `src/content/projects/en/<slug>.mdx` (idem `albums`). Le `/` du sous-dossier survit à la slugification du glob loader (contrairement à un suffixe `.en`). Helpers dans `src/i18n/content.ts` (`entriesForLang` avec **fallback FR** si la traduction manque).
- **Pages** : logique extraite dans `src/components/pages/*.astro` (prop `lang`) ; les routes `src/pages/**` (FR) et `src/pages/en/**` (EN) sont de fins wrappers.
- **SEO** : `<html lang>`, `hreflang` fr/en/x-default, `og:locale(:alternate)`, canonical par locale (slash final via `localeUrl`), sitemap i18n.

**Traduction auto dans l'admin** : bouton « Traduire en anglais » + onglets FR/EN sur chaque éditeur (projets, voyages, profil). Réutilise Groq (`admin/lib/groq.ts` → `translateText` pour le corps MDX, `translateFields` pour le frontmatter) ; écrit `en/<slug>.mdx` / `profile.en.json`, relu avant publication. Endpoints `admin/app/api/{projects,albums}/[slug]/translate` et `/api/profile/translate`.

## Déployer

```bash
git add . && git commit -m "..." && git push
ssh -i ~/chemin/vps_key root@147.79.115.121 "cd /var/www/nota && git pull && npm run build"
```

La clé SSH est sur le poste local (chemin à adapter). Le build génère `dist/` servi par Nginx.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/data/resume.tsx` | CV complet : nom, bio, skills, expériences, formation, navbar |
| `src/data/config.ts` | URL du site, thème amber, fontSize (locale & titres → `src/i18n/ui.ts`) |
| `src/i18n/ui.ts` | Chaînes UI FR/EN + helpers de locale/URL |
| `src/layouts/Layout.astro` | Layout global : FlickeringGrid, nav pills flottante, theme toggle |
| `src/components/HomePage.tsx` | Page d'accueil React : hero, derniers articles, à propos, expériences |
| `src/pages/contact.astro` | Formulaire Web3Forms (clé configurée) |
| `src/content/blog/` | Articles MDX — un fichier = un article |

## Écrire un article

Créer `src/content/blog/mon-article.mdx` :

```mdx
---
title: "Titre de l'article"
publishedAt: 2026-05-10
summary: "Résumé en une ligne affiché sur la homepage"
---

Contenu en Markdown ici.
```

Le site le détecte automatiquement au prochain build.

## Propriétaire

Stéphane Padrao — stephanepadrao@icloud.com
Chef de projet technique & entrepreneur tech
