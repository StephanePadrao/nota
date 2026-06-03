// Schéma + constantes client-safe (aucun import Node) : utilisable par
// ProfileEditor (client) ET par lib/profile.ts (serveur, fs).

export interface Identity {
  name: string;
  initials: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  email: string;
}
export interface WorkItem {
  company: string; href: string; badges: string[]; location: string;
  title: string; logoUrl: string; start: string; end: string; description: string;
}
export interface EducationItem {
  school: string; href: string; degree: string; logoUrl: string; start: string; end: string;
}
export interface Certification { name: string; issuer: string; date: string; href: string; }
export interface IconItem { name: string; icon: string; color: string; }

export interface Profile {
  identity: Identity;
  work: WorkItem[];
  education: EducationItem[];
  certifications: Certification[];
  skills: IconItem[];
  hobbies: IconItem[];
}

// Icônes proposées dans le sélecteur. Doivent exister côté site dans
// src/lib/icons.tsx (+ Mechanical), sinon le rendu retombe sur une icône par défaut.
export const ICON_NAMES = [
  "CircuitBoard", "Code2", "Cpu", "ShieldCheck", "Mechanical", "Factory", "Wrench",
  "Handshake", "Kanban", "Users", "TrendingUp", "BarChart2", "Plane", "Rocket", "Zap",
  "Gauge", "Music", "Tv2", "Hammer", "BookOpen", "Globe", "Camera", "Library", "House", "Mail",
];

export const EMPTY_PROFILE: Profile = {
  identity: { name: "", initials: "", location: "", locationLink: "", description: "", summary: "", avatarUrl: "", email: "" },
  work: [], education: [], certifications: [], skills: [], hobbies: [],
};
