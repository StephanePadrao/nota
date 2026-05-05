<div align="center">

# nota

**Site personnel de Stéphane Padrao** — chef de projet technique & entrepreneur tech

[![Live](https://img.shields.io/badge/Live-spadrao.erro.cloud-22c55e?style=flat-square)](https://spadrao.erro.cloud)
[![Astro](https://img.shields.io/badge/Astro-v6-BC52EE?logo=astro&logoColor=white&style=flat-square)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Déployé sur VPS](https://img.shields.io/badge/Hébergé-VPS_Nginx-F97316?style=flat-square)](https://spadrao.erro.cloud)

</div>

---

## À propos

**nota** est mon portfolio personnel et blog. Il présente mon parcours professionnel, mes compétences, mes projets, et mes articles de blog.

Le site est **statique, auto-hébergé** sur un VPS sous Nginx, sans dépendance à un service cloud tiers.

🌐 **Voir le site** → [spadrao.erro.cloud](https://spadrao.erro.cloud)

---

## Ce qui a été construit

Ce projet est basé sur le template open-source [Starfolio](https://github.com/webrating/starfolio) (Astro + React + Tailwind CSS v4), entièrement reconfiguré et enrichi. Voici l'ensemble des modifications et ajouts réalisés :

### Layout & Design

- **Layout deux colonnes** — Refonte complète de la homepage : profil à gauche (à propos, expériences, formation, compétences, loisirs), créations à droite (articles récents, projets). Colonne droite sticky sur desktop. Séparateur vertical CSS `before:`. Responsive mobile-first.
- **Conteneur élargi** — Passage de `max-w-2xl` à `max-w-7xl` pour exploiter toute la largeur de l'écran.
- **Navigation flottante pills** — Remplace la barre de nav d'origine. Pills indépendantes avec `backdrop-blur`, `bg-background/80`, thème toggle vanilla JS (sans `next-themes`).

### Animation d'arrière-plan

- **DiagonalGrid** — Composant canvas React custom (`src/components/magicui/diagonal-grid.tsx`) remplaçant le FlickeringGrid du template. Dessine des traits "/" qui scintillent, résout la couleur depuis les CSS variables (`var(--foreground)`) et s'adapte aux thèmes clair/sombre. Hauteur limitée à 30vh avec fondu CSS.

### Sections

- **Compétences** — Liste complète avec icônes colorées (lucide-react via helper `ci()` typé, + SVG custom `Mechanical` pour SolidWorks/Fusion 360).
- **Loisirs** — Nouvelle section "En dehors du bureau" avec les mêmes badges que les compétences.
- **Formation** — Logos en local (`/logos/`) : Zaack, Kickmaker (LinkedIn), Polytech (Wikipedia SVG) ; Google favicon pour MCA, Springcard, IAE Paris.
- **Expériences** — Logos d'entreprises en local avec composant `LogoImage` et fallback.

### Blog & Contenu

- **Images de couverture articles** — Support du champ `image` dans les frontmatter MDX :
  - Miniature dans la liste des articles récents (homepage)
  - Miniature dans la page `/blog` (slot fixe pour tous les articles)
  - Image pleine largeur en haut de chaque article
- **Template d'article** — `src/content/blog/_template.mdx` avec instructions étape par étape (exclu de la collection via glob `!**/_*.mdx`).
- **Page blog améliorée** — Dates en français (`5 mai 2026`), résumé sous chaque titre, slot thumbnail uniforme, pagination en français.
- **Favicon** — S blanc sur fond noir.

### Infrastructure & Qualité

- **Déploiement VPS** — Nginx + SSH, build Astro statique servi depuis `/var/www/nota/dist/`.
- **Middleware sécurité** — Headers HTTP : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Nettoyage codebase** — Suppression de la chaîne morte `NavbarIsland → Navbar → ModeToggle`, du dead code `orderedSections` dans HomePage, des assets orphelins (~3 Mo), typage `any` → `React.ComponentType`.
- **Formulaire de contact** — Web3Forms (clé configurée).

---

## Stack technique

| Couche | Outil |
|--------|-------|
| Framework | [Astro 6.2](https://astro.build) — `output: "static"` |
| UI interactif | [React 19](https://react.dev) (islands) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Contenu | MDX (`src/content/blog/`) |
| Données | `src/data/resume.tsx` + `src/data/config.ts` |
| Fonts | Outfit Variable (sans) + Geist Mono (code) |
| Thème | Amber — `oklch(0.52 0.17 55)` light / `oklch(0.74 0.16 55)` dark |
| Hébergement | VPS Ubuntu + Nginx |
| Formulaire | [Web3Forms](https://web3forms.com) |

---

## Structure du projet

```
src/
├── components/
│   ├── magicui/
│   │   └── diagonal-grid.tsx   # Animation canvas custom
│   ├── section/                # Sections de la homepage
│   ├── ui/svgs/
│   │   └── mechanical.tsx      # SVG custom engrenage
│   └── HomePage.tsx            # Layout deux colonnes
├── content/blog/
│   ├── _template.mdx           # Template de rédaction d'article
│   └── *.mdx                   # Articles publiés
├── data/
│   ├── resume.tsx              # Toutes les données personnelles
│   └── config.ts               # URL, thème, SEO
├── layouts/
│   └── Layout.astro            # Nav pills flottante + DiagonalGrid
├── pages/
│   ├── index.astro
│   ├── blog/
│   └── contact.astro
└── middleware.ts               # Security headers
public/
├── logos/                      # Logos entreprises & écoles
├── blog/                       # Images des articles
└── Profil-Pic.jpeg             # Photo de profil
```

---

## Déploiement

```bash
# Build local
npm run build

# Push vers GitHub
git add . && git commit -m "..." && git push

# Déploiement VPS
ssh -i ~/chemin/vps_key root@147.79.115.121 \
  "cd /var/www/nota && git pull && npm run build"
```

---

## Écrire un article

1. Copier `src/content/blog/_template.mdx` → `mon-article.mdx`
2. Remplir le frontmatter :

```mdx
---
title: "Titre de l'article"
publishedAt: "2026-05-05"
summary: "Une phrase de résumé."
image: "/blog/mon-article/cover.jpg"   # optionnel
---
```

3. Placer les images dans `public/blog/mon-article/`
4. Écrire le contenu en Markdown/MDX
5. Push → deploy

---

## Crédits

Ce projet est basé sur [Starfolio](https://github.com/webrating/starfolio) par [websiterating](https://github.com/webrating), lui-même inspiré du portfolio [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

---

<div align="center">

Stéphane Padrao · [spadrao.erro.cloud](https://spadrao.erro.cloud) · [contact](https://spadrao.erro.cloud/contact)

</div>
