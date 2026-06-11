// Dictionnaire i18n + helpers de routing. Pattern natif Astro, sans librairie.
// FR est la langue par défaut (URLs à la racine), EN/ES/PT sont préfixés (/en, /es, /pt).
// `en`, `es`, `pt` doivent refléter exactement la forme de `fr` (vérifié par le type Strings).

export const languages = { fr: "Français", en: "English", es: "Español", pt: "Português" } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = "fr";

// Codes de locale OpenGraph par langue (alignés sur les balises hreflang fr/en/es/pt).
export const localeOg: Record<Lang, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  pt: "pt_PT",
};

const fr = {
  htmlLang: "fr",
  dir: "ltr",

  seo: {
    homeTitle: "Stéphane Padrao — Responsable Produit & Maker Tech",
    ogDescription:
      "Ingénieur & Responsable Produit. De l'idée griffonnée à la carte électronique en production. Portfolio produit, hardware et tech.",
  },

  nav: {
    home: "Accueil",
    projects: "Projets",
    blog: "Blog",
    photos: "Voyages",
    contact: "Contact",
    themeToggle: "Changer de thème",
  },

  langSwitch: {
    label: "Changer de langue",
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
      text: "Des produits construits de zéro : side projects, outils, expérimentations. Tout est auto-hébergé ou open-source.",
    },
    blog: {
      label: "Blog",
      heading: "Fiches & notes",
      text: "Des notes de cours et fiches de révision, écrites pour transmettre simplement ce que j'apprends.",
    },
    contact: {
      label: "Contact",
      heading: "Parlons-en",
      text: "Une question, une idée, une opportunité ? Envoie-moi un message, je réponds à tout.",
      cta: "Écrire un message",
    },
  },

  projects: {
    metaTitle: "Projets",
    back: "Retour",
    active: "Actif",
  },

  blog: {
    metaTitle: "Blog",
    badge: "Blog",
    listingDescription: "Notes, fiches de révision et ce que j'apprends, expliqué simplement.",
    back: "Tous les articles",
    draft: "Brouillon",
    source: "Source",
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
  dir: "ltr",

  seo: {
    homeTitle: "Stéphane Padrao — Product Manager & Tech Maker",
    ogDescription:
      "Engineer & Product Manager. From a scribbled idea to a circuit board in production. Product, hardware and tech portfolio.",
  },

  nav: {
    home: "Home",
    projects: "Projects",
    blog: "Blog",
    photos: "Travels",
    contact: "Contact",
    themeToggle: "Toggle theme",
  },

  langSwitch: {
    label: "Change language",
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
      text: "Products built from scratch: side projects, tools, experiments. All self-hosted or open-source.",
    },
    blog: {
      label: "Blog",
      heading: "Notes & cheat sheets",
      text: "Course notes and revision sheets, written to pass on what I learn, simply.",
    },
    contact: {
      label: "Contact",
      heading: "Let's talk",
      text: "A question, an idea, an opportunity? Send me a message, I reply to everything.",
      cta: "Write a message",
    },
  },

  projects: {
    metaTitle: "Projects",
    back: "Back",
    active: "Active",
  },

  blog: {
    metaTitle: "Blog",
    badge: "Blog",
    listingDescription: "Notes, revision sheets and what I'm learning, explained simply.",
    back: "All posts",
    draft: "Draft",
    source: "Source",
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

const es: Strings = {
  htmlLang: "es",
  dir: "ltr",

  seo: {
    homeTitle: "Stéphane Padrao — Responsable de Producto & Maker Tech",
    ogDescription:
      "Ingeniero y Responsable de Producto. De la idea garabateada a la placa electrónica en producción. Portafolio de producto, hardware y tech.",
  },

  nav: {
    home: "Inicio",
    projects: "Proyectos",
    blog: "Blog",
    photos: "Viajes",
    contact: "Contacto",
    themeToggle: "Cambiar de tema",
  },

  langSwitch: {
    label: "Cambiar de idioma",
  },

  sections: {
    about: "Acerca de",
    work: "Experiencia",
    presentLabel: "Hoy",
    education: "Formación",
    certifications: "Certificaciones",
    skills: "Competencias",
    hobbies: "Fuera de la oficina",
    photosHeading: "Viajes y Fotos",
    projects: {
      label: "Proyectos",
      heading: "En lo que trabajo",
      text: "Productos construidos desde cero: side projects, herramientas, experimentos. Todo autoalojado u open-source.",
    },
    blog: {
      label: "Blog",
      heading: "Fichas y notas",
      text: "Apuntes de cursos y fichas de repaso, escritos para transmitir de forma sencilla lo que aprendo.",
    },
    contact: {
      label: "Contacto",
      heading: "Hablemos",
      text: "¿Una pregunta, una idea, una oportunidad? Escríbeme, respondo a todo.",
      cta: "Escribir un mensaje",
    },
  },

  projects: {
    metaTitle: "Proyectos",
    back: "Volver",
    active: "Activo",
  },

  blog: {
    metaTitle: "Blog",
    badge: "Blog",
    listingDescription: "Notas, fichas de repaso y lo que voy aprendiendo, explicado de forma sencilla.",
    back: "Todos los artículos",
    draft: "Borrador",
    source: "Fuente",
  },

  photos: {
    metaTitle: "Viajes",
    badge: "Viajes",
    listingDescription: "Viajes, descubrimientos y momentos de vida en imágenes.",
    back: "Todos los álbumes",
    albumMetaFallback: "Álbum de fotos — ",
  },

  contact: {
    metaTitle: "Contacto",
    heading: "Hablemos",
    intro: "¿Una pregunta, una idea, una oportunidad? Leo todos los mensajes y respondo a todos.",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    message: "Mensaje",
    messagePlaceholder: "Dime qué tienes en mente…",
    submit: "Enviar el mensaje",
    sending: "Enviando…",
    success: "✓ Mensaje enviado — te responderé pronto.",
    errorPrefix: "Ha ocurrido un error. También puedes escribirme directamente a",
    socialsIntro: "O encuéntrame en:",
    emailDirect: "Email directo",
  },

  notFound: {
    metaTitle: "404 - Página no encontrada",
    heading: "Página no encontrada",
    text: "Esta página no existe o se ha movido.",
    backHome: "Volver al inicio",
  },

  footer: {
    rights: "Todos los derechos reservados.",
  },

  lightbox: {
    close: "Cerrar",
    prev: "Imagen anterior",
    next: "Imagen siguiente",
  },
};

const pt: Strings = {
  htmlLang: "pt",
  dir: "ltr",

  seo: {
    homeTitle: "Stéphane Padrao — Gestor de Produto & Maker Tech",
    ogDescription:
      "Engenheiro e Gestor de Produto. Da ideia rabiscada à placa eletrónica em produção. Portefólio de produto, hardware e tech.",
  },

  nav: {
    home: "Início",
    projects: "Projetos",
    blog: "Blog",
    photos: "Viagens",
    contact: "Contacto",
    themeToggle: "Mudar de tema",
  },

  langSwitch: {
    label: "Mudar de idioma",
  },

  sections: {
    about: "Sobre",
    work: "Experiência",
    presentLabel: "Hoje",
    education: "Formação",
    certifications: "Certificações",
    skills: "Competências",
    hobbies: "Fora do escritório",
    photosHeading: "Viagens & Fotos",
    projects: {
      label: "Projetos",
      heading: "No que trabalho",
      text: "Produtos construídos do zero: side projects, ferramentas, experiências. Tudo auto-hospedado ou open-source.",
    },
    blog: {
      label: "Blog",
      heading: "Fichas & notas",
      text: "Apontamentos de cursos e fichas de revisão, escritos para transmitir de forma simples o que aprendo.",
    },
    contact: {
      label: "Contacto",
      heading: "Vamos falar",
      text: "Uma pergunta, uma ideia, uma oportunidade? Escreve-me, respondo a tudo.",
      cta: "Escrever uma mensagem",
    },
  },

  projects: {
    metaTitle: "Projetos",
    back: "Voltar",
    active: "Ativo",
  },

  blog: {
    metaTitle: "Blog",
    badge: "Blog",
    listingDescription: "Notas, fichas de revisão e o que vou aprendendo, explicado de forma simples.",
    back: "Todos os artigos",
    draft: "Rascunho",
    source: "Fonte",
  },

  photos: {
    metaTitle: "Viagens",
    badge: "Viagens",
    listingDescription: "Viagens, descobertas e momentos de vida em imagens.",
    back: "Todos os álbuns",
    albumMetaFallback: "Álbum de fotos — ",
  },

  contact: {
    metaTitle: "Contacto",
    heading: "Vamos falar",
    intro: "Uma pergunta, uma ideia, uma oportunidade? Leio todas as mensagens e respondo a todas.",
    name: "Nome",
    namePlaceholder: "O teu nome",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    message: "Mensagem",
    messagePlaceholder: "Diz-me o que tens em mente…",
    submit: "Enviar a mensagem",
    sending: "A enviar…",
    success: "✓ Mensagem enviada — responderei em breve.",
    errorPrefix: "Ocorreu um erro. Também podes escrever-me diretamente para",
    socialsIntro: "Ou encontra-me em:",
    emailDirect: "Email direto",
  },

  notFound: {
    metaTitle: "404 - Página não encontrada",
    heading: "Página não encontrada",
    text: "Esta página não existe ou foi movida.",
    backHome: "Voltar ao início",
  },

  footer: {
    rights: "Todos os direitos reservados.",
  },

  lightbox: {
    close: "Fechar",
    prev: "Imagem anterior",
    next: "Imagem seguinte",
  },
};

export const ui = { fr, en, es, pt } as const;

export function useTranslations(lang: Lang): Strings {
  return ui[lang] ?? ui[defaultLang];
}

// Préfixes d'URL des locales non-défaut.
const PREFIXED: Lang[] = ["en", "es", "pt"];

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split("/")[1];
  return (PREFIXED as string[]).includes(seg) ? (seg as Lang) : defaultLang;
}

// Préfixe un chemin interne pour la locale courante (FR = racine, autres = /xx).
export function localizeHref(path: string, lang: Lang): string {
  if (lang === defaultLang) return path;
  if (path === "/") return `/${lang}`;
  return `/${lang}${path}`;
}

// Retire le préfixe de langue pour retrouver le chemin canonique FR.
export function stripLangPrefix(pathname: string): string {
  for (const l of PREFIXED) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

// URL absolue normalisée avec slash final, pour canonical + hreflang. Cohérent
// avec la sortie statique d'Astro (format directory : /en/projects/x/).
export function localeUrl(path: string, lang: Lang, siteUrl: string): string {
  let p = localizeHref(path, lang);
  if (!p.endsWith("/")) p += "/";
  return new URL(p, siteUrl).href;
}
