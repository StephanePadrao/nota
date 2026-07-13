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
    homeTitle: "Stéphane Padrao, Responsable Produit & Maker Tech",
    ogDescription:
      "Ingénieur & Responsable Produit. De l'idée griffonnée à la carte électronique en production. Portfolio produit, hardware et tech.",
  },

  nav: {
    home: "Accueil",
    projects: "Projets",
    blog: "Blog",
    photos: "Voyages",
    contact: "Contact",
    freelance: "Freelance",
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
      text: "Une question, un projet, une mission ? Écris-moi, je réponds à tout.",
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
    albumMetaFallback: "Album photos, ",
  },

  contact: {
    metaTitle: "Contact",
    heading: "Parlons-en",
    intro: "Une question, un projet, ou une mission (design de carte, conseil en industrialisation) ? Décris ton besoin, je lis tous les messages et réponds à tous.",
    name: "Nom",
    namePlaceholder: "Ton nom ou prénom",
    email: "Email",
    emailPlaceholder: "ton@email.com",
    message: "Message",
    messagePlaceholder: "Dis-moi ce que tu as en tête…",
    submit: "Envoyer le message",
    sending: "Envoi en cours…",
    success: "✓ Message envoyé, je te répondrai rapidement.",
    errorPrefix: "Une erreur est survenue. Tu peux aussi m'écrire directement à",
    socialsIntro: "Ou retrouve-moi sur :",
    emailDirect: "Email direct",
  },

  freelance: {
    heading: "Missions freelance",
    intro: "Ingénieur électronique et Responsable Produit, disponible pour des missions, du cahier des charges au passage en production.",
    card1Title: "Design de carte électronique",
    card1Text: "Du schéma au PCB prêt pour la production.",
    card2Title: "Conseil en industrialisation",
    card2Text: "Du proto à la série, sourcing Chine/Europe, bancs de test, marquage CE.",
    cta: "Parlons-en",
  },

  freelancePage: {
    metaTitle: "Ingénieur électronique freelance",
    metaDescription:
      "Ingénieur électronique et produit en freelance : design de carte (PCB), conseil en industrialisation (proto à série, sourcing Chine/Europe, marquage CE) et expertise électronique. Missions freelance courtes ou longues, à Paris et à distance.",
    h1: "Ingénieur électronique freelance, design de carte et conseil en industrialisation",
    intro:
      "Ingénieur électronique et Responsable Produit, je fais le pont entre la carte et le marché : du cahier des charges au passage en production. Disponible pour des missions freelance, courtes comme longues, à Paris et à distance. Voici les portes d'entrée, chacune adossée à des projets réels.",
    relatedLabel: "Projets liés",
    services: [
      {
        title: "Cahier des charges & cadrage",
        text: "Définir le produit avant de le construire : cahier des charges (PRD), architecture, choix techno, étude de faisabilité. Pour partir sur des bases claires plutôt que de découvrir les contraintes en route.",
      },
      {
        title: "Design de carte électronique",
        text: "Du schéma au PCB prêt pour la production : saisie de schéma, choix des composants, routage, bring-up et mise au point. Pour un nouveau produit comme pour la refonte d'une carte existante.",
      },
      {
        title: "Revue & expertise",
        text: "Audit d'un design existant : relecture de schéma et de routage, revue de BOM (obsolescence, coûts, alternatives), et diagnostic de pannes ou de défauts terrain. Trouver la cause racine et la corriger au bon endroit, pas en surface.",
      },
      {
        title: "Sourcing & obsolescence",
        text: "Trouver des composants équivalents, gérer les fins de vie, arbitrer entre sources Chine et Europe. Sécuriser une nomenclature menacée par une rupture ou un composant obsolète.",
      },
      {
        title: "Conseil en industrialisation",
        text: "Passage du prototype à la série : DFM, bancs de test, mise en place de la production, marquage CE. Pour fiabiliser une production ou en monter une nouvelle.",
      },
    ],
    ctaIntro: "Un projet de carte, une production à fiabiliser, une panne à élucider ?",
    cta: "Décrire mon projet",
    reassurance: "Je réponds sous 48 h, et le premier échange est sans engagement.",
  },

  cvPage: {
    metaTitle: "CV",
    metaDescription:
      "CV de Stéphane Padrao, ingénieur électronique et Responsable Produit. Consultable en ligne et téléchargeable en PDF (français, anglais, espagnol, portugais).",
    h1: "CV",
    intro:
      "Ingénieur électronique et Responsable Produit. CV consultable ci-dessous et téléchargeable en PDF, en quatre langues.",
    download: "Télécharger le PDF",
    openInNewTab: "Ouvrir dans un onglet",
    linkLabel: "Voir mon CV",
  },

  blogCta: {
    heading: "Un projet hardware, une production à fiabiliser ?",
    text: "Ingénieur électronique et Responsable Produit, je prends des missions freelance, du cahier des charges au passage en production.",
    cta: "Parler de mon projet",
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
    homeTitle: "Stéphane Padrao, Product Manager & Tech Maker",
    ogDescription:
      "Engineer & Product Manager. From a scribbled idea to a circuit board in production. Product, hardware and tech portfolio.",
  },

  nav: {
    home: "Home",
    projects: "Projects",
    blog: "Blog",
    photos: "Travels",
    contact: "Contact",
    freelance: "Freelance",
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
      text: "A question, a project, an engagement? Send me a message, I reply to everything.",
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
    albumMetaFallback: "Photo album, ",
  },

  contact: {
    metaTitle: "Contact",
    heading: "Let's talk",
    intro: "A question, a project, or an engagement (PCB design, industrialization consulting)? Tell me about it, I read every message and reply to all.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@email.com",
    message: "Message",
    messagePlaceholder: "Tell me what's on your mind…",
    submit: "Send message",
    sending: "Sending…",
    success: "✓ Message sent, I'll get back to you soon.",
    errorPrefix: "Something went wrong. You can also email me directly at",
    socialsIntro: "Or find me on:",
    emailDirect: "Direct email",
  },

  freelance: {
    heading: "Freelance engagements",
    intro: "Electronics engineer and product manager, available for missions, from requirements spec to production ramp-up.",
    card1Title: "PCB design",
    card1Text: "From schematic to production-ready board.",
    card2Title: "Industrialization consulting",
    card2Text: "Proto to series, China/Europe sourcing, test benches, CE marking.",
    cta: "Let's talk",
  },

  freelancePage: {
    metaTitle: "Freelance electronics engineer",
    metaDescription:
      "Freelance electronics and product engineer: PCB design, industrialization consulting (proto to series, China/Europe sourcing, CE marking) and electronics troubleshooting. Freelance engagements, short or long, Paris and remote.",
    h1: "Freelance electronics engineer, PCB design and industrialization consulting",
    intro:
      "Electronics engineer and product manager, I bridge the board and the market: from requirements spec to production ramp-up. Available for freelance engagements, short or long, in Paris and remote. Here are the ways in, each backed by real projects.",
    relatedLabel: "Related projects",
    services: [
      {
        title: "Requirements & product scoping",
        text: "Define the product before building it: requirements spec (PRD), architecture, tech choices, feasibility study. To start on a clear footing instead of discovering constraints along the way.",
      },
      {
        title: "PCB design",
        text: "From schematic to production-ready board: schematic capture, component selection, routing, bring-up and tuning. For a new product or the redesign of an existing board.",
      },
      {
        title: "Design review & expertise",
        text: "Audit of an existing design: schematic and routing review, BOM review (obsolescence, costs, alternatives), and diagnosis of failures or field defects. Find the root cause and fix it in the right place, not on the surface.",
      },
      {
        title: "Sourcing & obsolescence",
        text: "Find equivalent components, manage end-of-life parts, weigh China vs Europe sources. Secure a bill of materials threatened by a shortage or an obsolete part.",
      },
      {
        title: "Industrialization consulting",
        text: "From prototype to series: DFM, test benches, production setup, CE marking. To stabilize a production line or set up a new one.",
      },
    ],
    ctaIntro: "A board to design, a production to stabilize, a fault to crack?",
    cta: "Describe my project",
    reassurance: "I reply within 48 h, and the first chat is no-commitment.",
  },

  cvPage: {
    metaTitle: "Résumé",
    metaDescription:
      "Stéphane Padrao's résumé — electronics engineer and product manager. Viewable online and downloadable as PDF (French, English, Spanish, Portuguese).",
    h1: "Résumé",
    intro:
      "Electronics engineer and product manager. View the résumé below and download it as PDF, in four languages.",
    download: "Download PDF",
    openInNewTab: "Open in a new tab",
    linkLabel: "View résumé",
  },

  blogCta: {
    heading: "A hardware project, a production to stabilize?",
    text: "Electronics engineer and product manager, I take on freelance engagements, from requirements spec to production ramp-up.",
    cta: "Discuss my project",
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
    homeTitle: "Stéphane Padrao, Responsable de Producto & Maker Tech",
    ogDescription:
      "Ingeniero y Responsable de Producto. De la idea garabateada a la placa electrónica en producción. Portafolio de producto, hardware y tech.",
  },

  nav: {
    home: "Inicio",
    projects: "Proyectos",
    blog: "Blog",
    photos: "Viajes",
    contact: "Contacto",
    freelance: "Freelance",
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
      text: "¿Una pregunta, un proyecto, una misión? Escríbeme, respondo a todo.",
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
    albumMetaFallback: "Álbum de fotos, ",
  },

  contact: {
    metaTitle: "Contacto",
    heading: "Hablemos",
    intro: "¿Una pregunta, un proyecto o una misión (diseño de placa, consultoría en industrialización)? Cuéntame, leo todos los mensajes y respondo a todos.",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    message: "Mensaje",
    messagePlaceholder: "Dime qué tienes en mente…",
    submit: "Enviar el mensaje",
    sending: "Enviando…",
    success: "✓ Mensaje enviado, te responderé pronto.",
    errorPrefix: "Ha ocurrido un error. También puedes escribirme directamente a",
    socialsIntro: "O encuéntrame en:",
    emailDirect: "Email directo",
  },

  freelance: {
    heading: "Misiones freelance",
    intro: "Ingeniero electrónico y responsable de producto, disponible para misiones, del pliego de condiciones al paso a producción.",
    card1Title: "Diseño de placa electrónica",
    card1Text: "Del esquema a la placa lista para producción.",
    card2Title: "Consultoría en industrialización",
    card2Text: "De proto a serie, sourcing China/Europa, bancos de prueba, marcado CE.",
    cta: "Hablemos",
  },

  freelancePage: {
    metaTitle: "Ingeniero electrónico freelance",
    metaDescription:
      "Ingeniero electrónico y de producto freelance: diseño de placa (PCB), consultoría en industrialización (de proto a serie, sourcing China/Europa, marcado CE) y peritaje electrónico. Misiones freelance cortas o largas, en París y en remoto.",
    h1: "Ingeniero electrónico freelance, diseño de placa y consultoría en industrialización",
    intro:
      "Ingeniero electrónico y responsable de producto, tiendo el puente entre la placa y el mercado: del pliego de condiciones al paso a producción. Disponible para misiones freelance, cortas o largas, en París y en remoto. Estas son las puertas de entrada, cada una respaldada por proyectos reales.",
    relatedLabel: "Proyectos relacionados",
    services: [
      {
        title: "Pliego de condiciones y encuadre",
        text: "Definir el producto antes de construirlo: pliego de condiciones (PRD), arquitectura, elecciones técnicas, estudio de viabilidad. Para partir de bases claras en vez de descubrir las restricciones sobre la marcha.",
      },
      {
        title: "Diseño de placa electrónica",
        text: "Del esquema a la placa lista para producción: captura de esquema, elección de componentes, enrutado, bring-up y puesta a punto. Para un producto nuevo o el rediseño de una placa existente.",
      },
      {
        title: "Revisión y peritaje",
        text: "Auditoría de un diseño existente: revisión de esquema y enrutado, revisión de BOM (obsolescencia, costes, alternativas), y diagnóstico de averías o defectos de campo. Encontrar la causa raíz y corregirla en el sitio adecuado, no en la superficie.",
      },
      {
        title: "Sourcing y obsolescencia",
        text: "Encontrar componentes equivalentes, gestionar los fines de vida, arbitrar entre fuentes de China y Europa. Asegurar una lista de materiales amenazada por una rotura o un componente obsoleto.",
      },
      {
        title: "Consultoría en industrialización",
        text: "Del prototipo a la serie: DFM, bancos de prueba, puesta en marcha de la producción, marcado CE. Para fiabilizar una producción o montar una nueva.",
      },
    ],
    ctaIntro: "¿Una placa que diseñar, una producción que fiabilizar, una avería que resolver?",
    cta: "Describir mi proyecto",
    reassurance: "Respondo en 48 h, y el primer intercambio es sin compromiso.",
  },

  cvPage: {
    metaTitle: "CV",
    metaDescription:
      "CV de Stéphane Padrao, ingeniero electrónico y responsable de producto. Consultable en línea y descargable en PDF (francés, inglés, español, portugués).",
    h1: "CV",
    intro:
      "Ingeniero electrónico y responsable de producto. CV consultable abajo y descargable en PDF, en cuatro idiomas.",
    download: "Descargar PDF",
    openInNewTab: "Abrir en una pestaña",
    linkLabel: "Ver mi CV",
  },

  blogCta: {
    heading: "¿Un proyecto hardware, una producción que fiabilizar?",
    text: "Ingeniero electrónico y responsable de producto, acepto misiones freelance, del pliego de condiciones al paso a producción.",
    cta: "Hablar de mi proyecto",
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
    homeTitle: "Stéphane Padrao, Gestor de Produto & Maker Tech",
    ogDescription:
      "Engenheiro e Gestor de Produto. Da ideia rabiscada à placa eletrónica em produção. Portefólio de produto, hardware e tech.",
  },

  nav: {
    home: "Início",
    projects: "Projetos",
    blog: "Blog",
    photos: "Viagens",
    contact: "Contacto",
    freelance: "Freelance",
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
      text: "Uma pergunta, um projeto, uma missão? Escreve-me, respondo a tudo.",
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
    albumMetaFallback: "Álbum de fotos, ",
  },

  contact: {
    metaTitle: "Contacto",
    heading: "Vamos falar",
    intro: "Uma pergunta, um projeto ou uma missão (design de placa, consultoria em industrialização)? Conta-me, leio todas as mensagens e respondo a todas.",
    name: "Nome",
    namePlaceholder: "O teu nome",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    message: "Mensagem",
    messagePlaceholder: "Diz-me o que tens em mente…",
    submit: "Enviar a mensagem",
    sending: "A enviar…",
    success: "✓ Mensagem enviada, responderei em breve.",
    errorPrefix: "Ocorreu um erro. Também podes escrever-me diretamente para",
    socialsIntro: "Ou encontra-me em:",
    emailDirect: "Email direto",
  },

  freelance: {
    heading: "Missões freelance",
    intro: "Engenheiro eletrónico e responsável de produto, disponível para missões, do caderno de encargos à passagem para produção.",
    card1Title: "Design de placa eletrónica",
    card1Text: "Do esquema à placa pronta para produção.",
    card2Title: "Consultoria em industrialização",
    card2Text: "De protótipo a série, sourcing China/Europa, bancadas de teste, marcação CE.",
    cta: "Vamos falar",
  },

  freelancePage: {
    metaTitle: "Engenheiro eletrónico freelance",
    metaDescription:
      "Engenheiro eletrónico e de produto freelance: design de placa (PCB), consultoria em industrialização (de protótipo a série, sourcing China/Europa, marcação CE) e peritagem eletrónica. Missões freelance curtas ou longas, em Paris e remoto.",
    h1: "Engenheiro eletrónico freelance, design de placa e consultoria em industrialização",
    intro:
      "Engenheiro eletrónico e responsável de produto, faço a ponte entre a placa e o mercado: do caderno de encargos à passagem para produção. Disponível para missões freelance, curtas ou longas, em Paris e remoto. Eis as portas de entrada, cada uma apoiada em projetos reais.",
    relatedLabel: "Projetos relacionados",
    services: [
      {
        title: "Caderno de encargos e enquadramento",
        text: "Definir o produto antes de o construir: caderno de encargos (PRD), arquitetura, escolhas técnicas, estudo de viabilidade. Para partir de bases claras em vez de descobrir as restrições pelo caminho.",
      },
      {
        title: "Design de placa eletrónica",
        text: "Do esquema à placa pronta para produção: captura de esquema, escolha de componentes, roteamento, bring-up e afinação. Para um novo produto ou a redefinição de uma placa existente.",
      },
      {
        title: "Revisão e peritagem",
        text: "Auditoria de um design existente: revisão de esquema e roteamento, revisão de BOM (obsolescência, custos, alternativas), e diagnóstico de avarias ou defeitos de campo. Encontrar a causa raiz e corrigi-la no sítio certo, não à superfície.",
      },
      {
        title: "Sourcing e obsolescência",
        text: "Encontrar componentes equivalentes, gerir os fins de vida, arbitrar entre fontes da China e da Europa. Garantir uma lista de materiais ameaçada por uma rutura ou um componente obsoleto.",
      },
      {
        title: "Consultoria em industrialização",
        text: "Do protótipo à série: DFM, bancadas de teste, arranque da produção, marcação CE. Para fiabilizar uma produção ou montar uma nova.",
      },
    ],
    ctaIntro: "Uma placa para desenhar, uma produção para fiabilizar, uma avaria para resolver?",
    cta: "Descrever o meu projeto",
    reassurance: "Respondo em 48 h, e a primeira conversa é sem compromisso.",
  },

  cvPage: {
    metaTitle: "CV",
    metaDescription:
      "CV de Stéphane Padrao, engenheiro eletrónico e responsável de produto. Consultável online e descarregável em PDF (francês, inglês, espanhol, português).",
    h1: "CV",
    intro:
      "Engenheiro eletrónico e responsável de produto. CV consultável abaixo e descarregável em PDF, em quatro línguas.",
    download: "Descarregar PDF",
    openInNewTab: "Abrir num separador",
    linkLabel: "Ver o meu CV",
  },

  blogCta: {
    heading: "Um projeto hardware, uma produção a fiabilizar?",
    text: "Engenheiro eletrónico e responsável de produto, aceito missões freelance, do caderno de encargos à passagem para produção.",
    cta: "Falar do meu projeto",
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
