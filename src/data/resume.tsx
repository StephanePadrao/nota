import React from "react";
import { Icons } from "@/components/icons";
import {
  House, Library, Mail,
  CircuitBoard, Code2, Cpu, ShieldCheck,
  Factory, Wrench, Handshake,
  Kanban, Users, TrendingUp, BarChart2,
  Plane, Rocket, Zap, Gauge, Music, Tv2, Hammer, BookOpen, Globe, Camera,
} from "lucide-react";
import { Mechanical } from "@/components/ui/svgs/mechanical";

const ci = (Icon: React.ComponentType<{ className?: string; color?: string }>, color: string) =>
  ({ className }: { className?: string }) =>
    <Icon className={className} color={color} />;


export const DATA = {
  name: "Stéphane Padrao",
  initials: "SP",
  url: "https://spadrao.erro.cloud",
  location: "Le Plessis-Robinson, France",
  locationLink: "https://www.google.com/maps/place/le+plessis-robinson+france",
  description:
    "Ingénieur de formation, Responsable Produit par métier, maker par choix. D'une idée griffonnée à une carte électronique en production. J'écris sur le produit, le design et la tech.",
  summary:
    "J'ai passé des années à dessiner des schémas électroniques. Le produit m'a rattrapé. Concevoir un produit, c'est assembler des contraintes : technique, usage, marché, production. Aujourd'hui Responsable Produit, je construis aussi mes propres projets tech en parallèle. La combinaison ingénieur-PM est rare. Ce blog, c'est l'endroit où je partage ce que j'observe des deux côtés.",
  avatarUrl: "/Profil-Pic.jpeg",
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
      enabled: false,
      label: "Événements",
      heading: "Événements & Expériences",
      text: "Conférences, meetups et formations marquants.",
    },
    hobbies: { order: 6, enabled: true, heading: "En dehors du bureau" },
    photos: {
      order: 7,
      enabled: true,
      heading: "Voyages & Photos",
    },
    contact: {
      order: 8,
      enabled: true,
      label: "Contact",
      heading: "Parlons-en",
      text: "Une question, une idée, une opportunité ? Envoie-moi un message — je réponds à tout.",
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
    { name: "Design électronique",        icon: ci(CircuitBoard, "#6366f1") },
    { name: "C / C++ ARM32",              icon: ci(Code2,        "#0ea5e9") },
    { name: "KiCad / Altium",             icon: ci(Cpu,          "#8b5cf6") },
    { name: "Certification CE",           icon: ci(ShieldCheck,  "#22c55e") },
    { name: "SolidWorks & Fusion 360",    icon: Mechanical },
    { name: "Industrialisation produit",  icon: ci(Factory,      "#f59e0b") },
    { name: "Lignes de production",       icon: ci(Wrench,       "#f97316") },
    { name: "Achats & négociation",       icon: ci(Handshake,    "#10b981") },
    { name: "Pilotage de projet",         icon: ci(Kanban,       "#7c3aed") },
    { name: "Management pluridisciplinaire", icon: ci(Users,     "#06b6d4") },
    { name: "Product Management",         icon: ci(TrendingUp,   "#f59e0b") },
    { name: "Étude de marché",            icon: ci(BarChart2,    "#ef4444") },
  ],

  hobbies: [
    { name: "Aviation",             icon: ci(Plane,   "#3b82f6") },
    { name: "Spatial",              icon: ci(Rocket,  "#6366f1") },
    { name: "Nouvelles techno",     icon: ci(Zap,     "#f59e0b") },
    { name: "F1 & WEC",             icon: ci(Gauge,   "#ef4444") },
    { name: "Musique",              icon: ci(Music,   "#ec4899") },
    { name: "Séries & Films",       icon: ci(Tv2,     "#8b5cf6") },
    { name: "Bricolage & Fab",      icon: ci(Hammer,  "#d97706") },
    { name: "Lecture",              icon: ci(BookOpen,"#22c55e") },
    { name: "Voyages",              icon: ci(Globe,   "#0d9488") },
    { name: "Photographie",         icon: ci(Camera,  "#64748b") },
  ],

  navbar: [
    { href: "/", icon: House, label: "Accueil" },
    { href: "/blog", icon: Library, label: "Blog" },
    { href: "/photos", icon: Camera, label: "Photos" },
    { href: "/contact", icon: Mail, label: "Contact" },
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
        url: "https://linkedin.com/in/SPADRAO",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com",
        icon: Icons.x,
        navbar: false,
      },
      Youtube: {
        name: "Youtube",
        url: "https://youtube.com",
        icon: Icons.youtube,
        navbar: false,
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
    {
      company: "Zaack (Igienair)",
      href: "https://zaack.fr",
      badges: ["Responsable Produit"],
      location: "Achères, France",
      title: "Responsable Produit",
      logoUrl: "/logos/zaack.png",
      start: "Janvier 2024",
      end: undefined,
      description:
        "Ingénieur hardware et Responsable Produit. Je m'occupe de l'architecture produit, de la stratégie, de la gestion de projets et des relations fournisseurs. Du circuit à la ligne de production, avec des partenaires en Chine et en Europe. Je manage une équipe de 3 à 5 personnes : électronique, software, mécanique.",
    },
    {
      company: "Kickmaker",
      href: "https://kickmaker.co",
      badges: [],
      location: "Paris 15, France",
      title: "Project Manager",
      logoUrl: "/logos/kickmaker.png",
      start: "Juin 2022",
      end: "Janvier 2024",
      description:
        "Studio de développement produit hardware à Paris. J'accompagne les clients du POC au PVT : électronique, mécanique, software, certification. Hermès, ELAX Énergie, Javelot, Zaack. Un pied dans les startups parisiennes, l'autre dans les contraintes industrielles.",
    },
    {
      company: "MCA Ingénierie / Carmat SA",
      href: "https://mca-ingenierie.fr",
      badges: [],
      location: "Levallois-Perret, France",
      title: "Ingénieur design électronique",
      logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=mca-ingenierie.fr",
      start: "Septembre 2021",
      end: "Février 2022",
      description:
        "Mission chez Carmat, le fabricant du cœur artificiel. Mise à jour des dossiers de conception, amélioration des étages puissance, analyse des défauts détectés en production.",
    },
    {
      company: "Springcard SAS",
      href: "https://www.springcard.com",
      badges: ["Alternance"],
      location: "Palaiseau, France",
      title: "Apprenti Ingénieur système embarqué — Responsable production",
      logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=springcard.com",
      start: "Septembre 2018",
      end: "Juillet 2021",
      description:
        "3 ans d'alternance sur des produits NFC/RFID. De la schématisation au PCB jusqu'à la mise en production. Dernière année : responsable de la production, gestion d'équipe et relations fournisseurs.",
    },
  ],

  education: [
    {
      school: "IAE Paris — Sorbonne Business School",
      href: "https://www.iae-paris.com",
      degree: "MAE Executive MBA — Management et Administration des Entreprises",
      logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=iae-paris.com",
      start: "2020",
      end: "2022",
    },
    {
      school: "Polytech Sorbonne — Paris",
      href: "https://www.polytech.sorbonne-universite.fr",
      degree: "Diplôme d'Ingénieur — Électronique et Informatique Industrielle (EI2I)",
      logoUrl: "/logos/polytech.svg",
      start: "2018",
      end: "2021",
    },
  ],

  projects: [
    {
      title: "Nota",
      href: "https://spadrao.erro.cloud",
      dates: "Mai 2026 - Aujourd'hui",
      active: true,
      description:
        "Blog personnel et espace de réflexion, construit sur Astro (Starfolio). Auto-hébergé sur un VPS avec Nginx — ownership total des données, zéro dépendance plateforme.",
      technologies: ["Astro", "TypeScript", "TailwindCSS", "Nginx"],
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
      title: "SensiAir",
      href: "https://sensiair.erro.cloud",
      dates: "2025 - Aujourd'hui",
      active: true,
      description:
        "Application web de surveillance de la qualité de l'air intérieur. Dashboard temps réel, carte interactive, rapports PDF avec analyse IA. Architecture multi-tenant : chaque client voit uniquement ses données.",
      technologies: ["SvelteKit", "TypeScript", "Supabase", "TailwindCSS"],
      links: [
        {
          type: "Site",
          href: "https://sensiair.erro.cloud",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Code",
          href: "https://github.com/StephanePadrao/SensiAir",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/sensiair-preview.png",
      video: "",
    },
    {
      title: "Tempo",
      href: "https://tempo.erro.cloud",
      dates: "2025 - Aujourd'hui",
      active: true,
      description:
        "Application de suivi de temps personnelle. Auto-hébergée sur VPS, gérée avec PM2.",
      technologies: ["Node.js", "PM2", "VPS"],
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
  ],

  hackathons: [
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
