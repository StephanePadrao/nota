import path from "path";
import fs from "fs";
import { EMPTY_PROFILE, type Profile } from "./profile-schema";
import { DEFAULT_LANG, type Lang } from "./i18n";

export type { Profile } from "./profile-schema";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

const PROFILE_FILES: Record<Lang, string> = {
  fr: path.join(NOTA_ROOT, "src/data/profile.json"),
  en: path.join(NOTA_ROOT, "src/data/profile.en.json"),
};

const str = (v: unknown) => (v == null ? "" : String(v));

export function readProfile(lang: Lang = DEFAULT_LANG): Profile {
  const file = PROFILE_FILES[lang];
  // EN absent → repli sur le FR (jamais de profil vide à traduire), comme côté site.
  if (!fs.existsSync(file)) return lang === "en" ? readProfile("fr") : EMPTY_PROFILE;
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<Profile>;
    return {
      identity: { ...EMPTY_PROFILE.identity, ...(raw.identity ?? {}) },
      work: Array.isArray(raw.work) ? raw.work : [],
      education: Array.isArray(raw.education) ? raw.education : [],
      certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
      skills: Array.isArray(raw.skills) ? raw.skills : [],
      hobbies: Array.isArray(raw.hobbies) ? raw.hobbies : [],
    };
  } catch (err) {
    console.warn(`[profile] JSON illisible (${lang}), repli sur le profil vide :`, err);
    return EMPTY_PROFILE;
  }
}

// Normalise tout le document avant écriture : le formulaire envoie le profil complet,
// on coerce chaque champ pour qu'un payload malformé ne casse pas le build du site.
export function writeProfile(data: Profile, lang: Lang = DEFAULT_LANG): void {
  const clean: Profile = {
    identity: {
      name: str(data.identity?.name), initials: str(data.identity?.initials),
      location: str(data.identity?.location), locationLink: str(data.identity?.locationLink),
      description: str(data.identity?.description), summary: str(data.identity?.summary),
      avatarUrl: str(data.identity?.avatarUrl), email: str(data.identity?.email),
    },
    work: (data.work ?? []).map((w) => ({
      company: str(w.company), href: str(w.href),
      badges: Array.isArray(w.badges) ? w.badges.map(str).filter(Boolean) : [],
      location: str(w.location), title: str(w.title), logoUrl: str(w.logoUrl),
      start: str(w.start), end: str(w.end), description: str(w.description),
    })),
    education: (data.education ?? []).map((e) => ({
      school: str(e.school), href: str(e.href), degree: str(e.degree),
      logoUrl: str(e.logoUrl), start: str(e.start), end: str(e.end),
    })),
    certifications: (data.certifications ?? []).map((c) => ({
      name: str(c.name), issuer: str(c.issuer), date: str(c.date), href: str(c.href),
    })),
    skills: (data.skills ?? []).map((s) => ({ name: str(s.name), icon: str(s.icon), color: str(s.color) })),
    hobbies: (data.hobbies ?? []).map((h) => ({ name: str(h.name), icon: str(h.icon), color: str(h.color) })),
  };
  fs.writeFileSync(PROFILE_FILES[lang], JSON.stringify(clean, null, 2) + "\n", "utf8");
}
