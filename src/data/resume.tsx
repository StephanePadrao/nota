import { Icons } from "@/components/icons";
import { House, Library } from "lucide-react";
import { Astro } from "@/components/ui/svgs/astro";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Docker } from "@/components/ui/svgs/docker";
import { Python } from "@/components/ui/svgs/python";

export const DATA = {
  name: "Stéphane Padrao",
  initials: "SP",
  url: "https://spadrao.erro.cloud",
  location: "France", // TODO: préciser la ville si souhaité
  locationLink: "https://www.google.com/maps/place/france",
  description:
    "Chef de projet technique. Je construis des produits, j'explore l'indie hacking, et j'écris sur ce que j'apprends.",
  summary:
    "Après plusieurs années comme chef de projet technique, je travaille à construire mes propres produits et à développer une activité freelance. J'écris sur ce que j'apprends — produit, design, entrepreneuriat. Nota est mon espace pour noter, réfléchir et partager.",
  avatarUrl: "/picofme.png",
  ogImage: "/og_image.png",

  sections: {
    about: { order: 1, enabled: true, heading: "À propos" },
    work: { order: 2, enabled: true, heading: "Expériences", presentLabel: "Aujourd'hui" },
    education: { order: 3, enabled: true, heading: "Formation" },
    skills: { order: 4, enabled: true, heading: "Compétences" },
    projects: {
      order: 5,
      enabled: true,
      label: "Projets",
      heading: "Ce sur quoi je travaille",
      text: "Des produits construits de zéro — side projects, outils, expérimentations. Tout est auto-hébergé ou open-source.",
    },
    hackathons: {
      order: 7,
      enabled: false, // TODO: réactiver et remplir avec de vrais événements
      label: "Événements",
      heading: "Événements & Expériences",
      text: "Conférences, meetups et formations marquants.",
    },
    photos: {
      order: 6,
      enabled: false, // TODO: réactiver quand les vraies photos sont prêtes
      heading: "En dehors du code",
    },
    contact: {
      order: 8,
      enabled: true,
      label: "Contact",
      heading: "Parlons-en",
      text: "Une question, une idée, une opportunité ? Envoie-moi un message, je réponds à tout.",
    },
  },

  photos: [
    { src: "/photos/photo1.jpg", alt: "Photo 1" },
    { src: "/photos/photo2.jpg", alt: "Photo 2" },
    { src: "/photos/photo3.jpg", alt: "Photo 3" },
    { src: "/photos/photo4.jpg", alt: "Photo 4" },
    { src: "/photos/photo5.jpg", alt: "Photo 5" },
    { src: "/photos/photo6.jpg", alt: "Photo 6" },
    { src: "/photos/photo7.jpg", alt: "Photo 7" },
    { src: "/photos/photo8.jpg", alt: "Photo 8" },
    { src: "/photos/photo9.jpg", alt: "Photo 9" },
  ],

  skills: [
    { name: "Astro", icon: Astro },
    { name: "React", icon: ReactLight },
    { name: "TypeScript", icon: Typescript },
    { name: "Node.js", icon: Nodejs },
    { name: "Python", icon: Python },
    { name: "Docker", icon: Docker },
  ],

  navbar: [
    { href: "/", icon: House, label: "Accueil" },
    { href: "/blog", icon: Library, label: "Blog" },
  ],

  contact: {
    email: "stephanepadrao@icloud.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/StephanePadrao",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/stephane-padrao", // TODO: vérifier l'URL exacte
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com",
        icon: Icons.x,
        navbar: false, // désactivé — TODO: ajouter URL si compte actif
      },
      Youtube: {
        name: "Youtube",
        url: "https://youtube.com",
        icon: Icons.youtube,
        navbar: false, // désactivé — TODO: ajouter URL si chaîne active
      },
      email: {
        name: "Envoyer un email",
        url: "mailto:stephanepadrao@icloud.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    // TODO: remplacer par tes vraies expériences professionnelles
    // Structure : company, href, badges[], location, title, logoUrl, start, end (undefined = poste actuel), description
    {
      company: "Poste actuel",
      href: "#",
      badges: ["CdP"],
      location: "France",
      title: "Chef de projet technique",
      logoUrl: "https://avatar.vercel.sh/poste-actuel?size=40",
      start: "À compléter",
      end: undefined,
      description:
        "TODO: Décrire les responsabilités, l'équipe, les technologies utilisées et les réalisations.",
    },
    {
      company: "Expérience précédente",
      href: "#",
      badges: [],
      location: "France",
      title: "À compléter",
      logoUrl: "https://avatar.vercel.sh/exp-precedente?size=40",
      start: "À compléter",
      end: "À compléter",
      description:
        "TODO: Décrire les responsabilités et réalisations.",
    },
  ],

  education: [
    // TODO: remplacer par tes vraies formations/diplômes
    {
      school: "Formation principale",
      href: "#",
      degree: "À compléter",
      logoUrl: "https://avatar.vercel.sh/formation?size=40",
      start: "À compléter",
      end: "À compléter",
    },
  ],

  projects: [
    {
      title: "Nota",
      href: "https://spadrao.erro.cloud",
      dates: "Mai 2026 - Aujourd'hui",
      active: true,
      description:
        "Blog personnel et espace de réflexion, construit avec Astro (Starfolio). Auto-hébergé sur un VPS avec Nginx — ownership total des données, zéro dépendance plateforme.",
      technologies: ["Astro", "TypeScript", "TailwindCSS", "Nginx", "VPS"],
      links: [
        {
          type: "Site",
          href: "https://spadrao.erro.cloud",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Code",
          href: "https://github.com/StephanePadrao/nota",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/example-website.webp",
      video: "",
    },
    {
      title: "Tempo",
      href: "https://tempo.erro.cloud",
      dates: "2025 - Aujourd'hui",
      active: true,
      description:
        "TODO: Décrire ce que fait Tempo.", // TODO: remplir la description de Tempo
      technologies: ["Node.js", "VPS", "PM2"],
      links: [
        {
          type: "Site",
          href: "https://tempo.erro.cloud",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    // TODO: ajouter d'autres projets si nécessaire
  ],

  hackathons: [
    // TODO: remplacer par de vrais événements (conférences, meetups, formations)
    // La section est désactivée (enabled: false dans sections.hackathons)
    {
      title: "À compléter",
      dates: "2026",
      location: "France",
      description: "TODO: ajouter de vrais événements ici.",
      image: "https://avatar.vercel.sh/todo?size=40",
      links: [],
    },
  ],
} as const;
