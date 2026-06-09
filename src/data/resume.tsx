import React from "react";
import {
  House, Mail, Hammer, Camera, Globe, Library,
  CircuitBoard, Code2, Cpu, ShieldCheck,
  Factory, Wrench, Handshake,
  Kanban, Users, TrendingUp, BarChart2,
  Plane, Rocket, Zap, Gauge, Music, Tv2, BookOpen,
} from "@/lib/icons";
import { Mechanical } from "@/components/ui/svgs/mechanical";
import profileFr from "./profile.json";
import { defaultLang, localizeHref, useTranslations, type Lang } from "@/i18n/ui";

// profile.en.json est optionnel : chargé via glob (eager) pour NE PAS casser le
// build s'il est absent — repli FR par design, cohérent avec l'admin.
const enProfileModules = import.meta.glob("./profile.en.json", { eager: true, import: "default" });
const profileEn = (Object.values(enProfileModules)[0] ?? profileFr) as typeof profileFr;
const profiles: Record<Lang, typeof profileFr> = { fr: profileFr, en: profileEn };

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

const SITE_URL = "https://spadrao.erro.cloud";

// Assemble le modèle de données du CV pour une locale : contenu éditable depuis
// le bon profile JSON, intitulés/SEO/nav depuis le dictionnaire i18n, structure
// (icônes, ordre, réseaux) figée en code. Les valeurs renvoyées contiennent des
// composants React (icônes) → à construire DANS le bundle de l'îlot, pas à
// sérialiser à travers la frontière Astro→island.
export function buildData(lang: Lang = defaultLang) {
  const profile = profiles[lang] ?? profiles[defaultLang];
  const t = useTranslations(lang);

  return {
    name: profile.identity.name,
    initials: profile.identity.initials,
    url: SITE_URL,
    location: profile.identity.location,
    locationLink: profile.identity.locationLink,
    description: profile.identity.description,
    ogDescription: t.seo.ogDescription,
    summary: profile.identity.summary,
    avatarUrl: profile.identity.avatarUrl,
    ogImage: "/og_image.png",

    sections: {
      about: { heading: t.sections.about },
      work: { heading: t.sections.work, presentLabel: t.sections.presentLabel },
      education: { heading: t.sections.education },
      certifications: { heading: t.sections.certifications },
      skills: { heading: t.sections.skills },
      hobbies: { heading: t.sections.hobbies },
      photos: { heading: t.sections.photosHeading },
      projects: {
        label: t.sections.projects.label,
        heading: t.sections.projects.heading,
        text: t.sections.projects.text,
      },
      contact: {
        label: t.sections.contact.label,
        heading: t.sections.contact.heading,
        text: t.sections.contact.text,
        cta: t.sections.contact.cta,
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

    // Contenu éditable via l'admin (profile JSON) ──────────────────────────────
    skills: profile.skills.map((s) => ({ name: s.name, icon: resolveIcon(s.icon, s.color) })),
    hobbies: profile.hobbies.map((h) => ({ name: h.name, icon: resolveIcon(h.icon, h.color) })),
    certifications: profile.certifications as Certification[],
    work: profile.work.map((w) => ({ ...w, end: w.end ? w.end : undefined })),
    education: profile.education,
    // ─────────────────────────────────────────────────────────────────────────

    navbar: [
      { href: localizeHref("/", lang), icon: House, label: t.nav.home },
      { href: localizeHref("/projects", lang), icon: Hammer, label: t.nav.projects },
      { href: localizeHref("/photos", lang), icon: Camera, label: t.nav.photos },
      { href: localizeHref("/contact", lang), icon: Mail, label: t.nav.contact },
    ],
  };
}

export type ResumeData = ReturnType<typeof buildData>;
