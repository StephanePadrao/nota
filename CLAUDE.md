# Nota — Site personnel de Stéphane Padrao

Site Astro 6 statique déployé sur `https://spadrao.erro.cloud`.

## Stack

- **Framework** : Astro 6.2 (`output: "static"`)
- **UI** : React (composants interactifs), TailwindCSS v4, shadcn/ui
- **Contenu** : MDX dans `src/content/blog/`
- **Données** : tout dans `src/data/resume.tsx` (CV, skills, navbar) + `src/data/config.ts` (thème, couleurs, URL)
- **Fonts** : Outfit Variable (sans-serif), Geist Mono (code)
- **Thème** : amber — `oklch(0.52 0.17 55)` light / `oklch(0.74 0.16 55)` dark

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
| `src/data/config.ts` | URL du site, thème amber, locale fr_FR, fontSize |
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
