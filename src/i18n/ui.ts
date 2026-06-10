// Dictionnaire i18n + helpers de routing. Pattern natif Astro, sans librairie.
// FR est la langue par défaut (URLs à la racine), EN est préfixé /en.
// `en` doit refléter exactement la forme de `fr` (vérifié par le type Strings).

export const languages = { fr: "Français", en: "English" } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = "fr";

const fr = {
  htmlLang: "fr",
  ogLocale: "fr_FR",
  ogLocaleAlternate: "en_US",
  dir: "ltr",

  seo: {
    homeTitle: "Stéphane Padrao — Responsable Produit & Maker Tech",
    ogDescription:
      "Ingénieur & Responsable Produit. De l'idée griffonnée à la carte électronique en production. Portfolio produit, hardware et tech.",
  },

  nav: {
    home: "Accueil",
    projects: "Projets",
    photos: "Voyages",
    contact: "Contact",
    themeToggle: "Changer de thème",
  },

  langSwitch: {
    toFr: "Passer en français",
    toEn: "Passer en anglais",
  },

  sections: {
    about: "À propos",
    work: "Expériences",
    presentLabel: "Aujourd'hui",
    education: "Formation",
    certifications: "Certifications",
    skills: "Compétences",
    hobbies: "En dehors du bureau",
    photosHeading: "Voyages & Photos",
    projects: {
      label: "Projets",
      heading: "Ce sur quoi je travaille",
      text: "Des produits construits de zéro — side projects, outils, expérimentations. Tout est auto-hébergé ou open-source.",
    },
    contact: {
      label: "Contact",
      heading: "Parlons-en",
      text: "Une question, une idée, une opportunité ? Envoie-moi un message — je réponds à tout.",
      cta: "Écrire un message",
    },
  },

  projects: {
    metaTitle: "Projets",
    back: "Retour",
    active: "Actif",
  },

  photos: {
    metaTitle: "Voyages",
    badge: "Voyages",
    listingDescription: "Voyages, découvertes et moments de vie en images.",
    back: "Tous les albums",
    albumMetaFallback: "Album photos — ",
  },

  contact: {
    metaTitle: "Contact",
    heading: "Parlons-en",
    intro: "Une question, une idée, une opportunité ? Je lis tous les messages et réponds à tous.",
    name: "Nom",
    namePlaceholder: "Ton nom ou prénom",
    email: "Email",
    emailPlaceholder: "ton@email.com",
    message: "Message",
    messagePlaceholder: "Dis-moi ce que tu as en tête…",
    submit: "Envoyer le message",
    sending: "Envoi en cours…",
    success: "✓ Message envoyé — je te répondrai rapidement.",
    errorPrefix: "Une erreur est survenue. Tu peux aussi m'écrire directement à",
    socialsIntro: "Ou retrouve-moi sur :",
    emailDirect: "Email direct",
  },

  notFound: {
    metaTitle: "404 - Page introuvable",
    heading: "Page introuvable",
    text: "Cette page n'existe pas ou a été déplacée.",
    backHome: "Retour à l'accueil",
  },

  footer: {
    rights: "Tous droits réservés.",
  },

  lightbox: {
    close: "Fermer",
    prev: "Image précédente",
    next: "Image suivante",
  },
};

export type Strings = typeof fr;

const en: Strings = {
  htmlLang: "en",
  ogLocale: "en_US",
  ogLocaleAlternate: "fr_FR",
  dir: "ltr",

  seo: {
    homeTitle: "Stéphane Padrao — Product Manager & Tech Maker",
    ogDescription:
      "Engineer & Product Manager. From a scribbled idea to a circuit board in production. Product, hardware and tech portfolio.",
  },

  nav: {
    home: "Home",
    projects: "Projects",
    photos: "Travels",
    contact: "Contact",
    themeToggle: "Toggle theme",
  },

  langSwitch: {
    toFr: "Switch to French",
    toEn: "Switch to English",
  },

  sections: {
    about: "About",
    work: "Experience",
    presentLabel: "Present",
    education: "Education",
    certifications: "Certifications",
    skills: "Skills",
    hobbies: "Outside the office",
    photosHeading: "Travels & Photos",
    projects: {
      label: "Projects",
      heading: "What I'm working on",
      text: "Products built from scratch — side projects, tools, experiments. All self-hosted or open-source.",
    },
    contact: {
      label: "Contact",
      heading: "Let's talk",
      text: "A question, an idea, an opportunity? Send me a message — I reply to everything.",
      cta: "Write a message",
    },
  },

  projects: {
    metaTitle: "Projects",
    back: "Back",
    active: "Active",
  },

  photos: {
    metaTitle: "Travels",
    badge: "Travels",
    listingDescription: "Travels, discoveries and slices of life in pictures.",
    back: "All albums",
    albumMetaFallback: "Photo album — ",
  },

  contact: {
    metaTitle: "Contact",
    heading: "Let's talk",
    intro: "A question, an idea, an opportunity? I read every message and reply to all.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    message: "Message",
    messagePlaceholder: "Tell me what's on your mind…",
    submit: "Send message",
    sending: "Sending…",
    success: "✓ Message sent — I'll get back to you soon.",
    errorPrefix: "Something went wrong. You can also email me directly at",
    socialsIntro: "Or find me on:",
    emailDirect: "Direct email",
  },

  notFound: {
    metaTitle: "404 - Page not found",
    heading: "Page not found",
    text: "This page doesn't exist or has moved.",
    backHome: "Back home",
  },

  footer: {
    rights: "All rights reserved.",
  },

  lightbox: {
    close: "Close",
    prev: "Previous image",
    next: "Next image",
  },
};

export const ui = { fr, en } as const;

export function useTranslations(lang: Lang): Strings {
  return ui[lang] ?? ui[defaultLang];
}

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split("/")[1];
  return seg === "en" ? "en" : defaultLang;
}

// Préfixe un chemin interne pour la locale courante (FR = racine, EN = /en).
export function localizeHref(path: string, lang: Lang): string {
  if (lang === defaultLang) return path;
  if (path === "/") return `/${lang}`;
  return `/${lang}${path}`;
}

// Retire le préfixe de langue pour retrouver le chemin canonique FR.
export function stripLangPrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

// URL absolue normalisée avec slash final, pour canonical + hreflang. Cohérent
// avec la sortie statique d'Astro (format directory : /en/projects/x/).
export function localeUrl(path: string, lang: Lang, siteUrl: string): string {
  let p = localizeHref(path, lang);
  if (!p.endsWith("/")) p += "/";
  return new URL(p, siteUrl).href;
}
