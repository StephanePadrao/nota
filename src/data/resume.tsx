import React from "react";
import { Icons } from "@/components/icons";
import {
  House, Mail, Hammer, Camera, Globe, Library,
  CircuitBoard, Code2, Cpu, ShieldCheck,
  Factory, Wrench, Handshake,
  Kanban, Users, TrendingUp, BarChart2,
  Plane, Rocket, Zap, Gauge, Music, Tv2, BookOpen,
} from "@/lib/icons";
import { Mechanical } from "@/components/ui/svgs/mechanical";
import profile from "./profile.json";

type IconComponent = React.ComponentType<{ className?: string; color?: string }>;

// Les compétences/hobbies stockent un NOM d'icône (string) dans profile.json,
// résolu ici. Une icône = un composant SVG (code), non sérialisable en JSON :
// le mapping nom → composant reste donc figé côté code.
const ICON_MAP: Record<string, IconComponent> = {
  CircuitBoard, Code2, Cpu, ShieldCheck, Mechanical, Factory, Wrench, Handshake,
  Kanban, Users, TrendingUp, BarChart2, Plane, Rocket, Zap, Gauge, Music, Tv2,
  Hammer, BookOpen, Globe, Camera, Library, House, Mail,
};

const ci = (Icon: IconComponent, color: string) =>
  ({ className }: { className?: string }) =>
    <Icon className={className} color={color} />;

const resolveIcon = (name: string, color: string) =>
  ci(ICON_MAP[name] ?? ShieldCheck, color || "currentColor");

type Certification = { name: string; issuer: string; date: string; href?: string };

export const DATA = {
  name: profile.identity.name,
  initials: profile.identity.initials,
  url: "https://spadrao.erro.cloud",
  location: profile.identity.location,
  locationLink: profile.identity.locationLink,
  description: profile.identity.description,
  ogDescription:
    "Ingénieur & Responsable Produit. De l'idée griffonnée à la carte électronique en production. Portfolio produit, hardware et tech.",
  summary: profile.identity.summary,
  avatarUrl: profile.identity.avatarUrl,
  ogImage: "/og_image.png",

  // Structure du site (ordre, sections, intitulés) — volontairement en code, pas dans le CMS.
  sections: {
    about: { order: 1, enabled: true, heading: "À propos" },
    work: { order: 2, enabled: true, heading: "Expériences", presentLabel: "Aujourd'hui" },
    education: { order: 3, enabled: true, heading: "Formation" },
    certifications: { order: 4, enabled: true, heading: "Certifications" },
    skills: { order: 5, enabled: true, heading: "Compétences" },
    projects: {
      order: 6,
      enabled: true,
      label: "Projets",
      heading: "Ce sur quoi je travaille",
      text: "Des produits construits de zéro — side projects, outils, expérimentations. Tout est auto-hébergé ou open-source.",
    },
    hackathons: {
      order: 8,
      enabled: false,
      label: "Événements",
      heading: "Événements & Expériences",
      text: "Conférences, meetups et formations marquants.",
    },
    hobbies: { order: 7, enabled: true, heading: "En dehors du bureau" },
    photos: { order: 7, enabled: true, heading: "Voyages & Photos" },
    contact: {
      order: 9,
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

  // Contenu éditable via l'admin (profile.json) ──────────────────────────────
  skills: profile.skills.map((s) => ({ name: s.name, icon: resolveIcon(s.icon, s.color) })),
  hobbies: profile.hobbies.map((h) => ({ name: h.name, icon: resolveIcon(h.icon, h.color) })),
  // certifications: tableau vide au seed → assertion (JSON infère never[]).
  certifications: profile.certifications as Certification[],
  work: profile.work.map((w) => ({ ...w, end: w.end ? w.end : undefined })),
  education: profile.education,
  // ───────────────────────────────────────────────────────────────────────────

  navbar: [
    { href: "/", icon: House, label: "Accueil" },
    { href: "/projects", icon: Hammer, label: "Projets" },
    { href: "/photos", icon: Camera, label: "Voyages" },
    { href: "/contact", icon: Mail, label: "Contact" },
  ],

  contact: {
    email: profile.identity.email,
    tel: "",
    social: {
      GitHub: { name: "GitHub", url: "https://github.com/StephanePadrao", icon: Icons.github, navbar: true },
      LinkedIn: { name: "LinkedIn", url: "https://linkedin.com/in/SPADRAO", icon: Icons.linkedin, navbar: true },
      X: { name: "X", url: "https://x.com", icon: Icons.x, navbar: false },
      Youtube: { name: "Youtube", url: "https://youtube.com", icon: Icons.youtube, navbar: false },
      email: { name: "Envoyer un email", url: `mailto:${profile.identity.email}`, icon: Icons.email, navbar: false },
    },
  },

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
};
