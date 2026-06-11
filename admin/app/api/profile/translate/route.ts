import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readProfile, writeProfile, type Profile } from "@/lib/profile";
import { translateFields } from "@/lib/groq";
import { parseLang } from "@/lib/i18n";

// Traduit le profil FR (CV) → écrit profile.<lang>.json (?lang=en|es|pt). Prose traduite
// (accroche, résumé, postes, descriptions, badges, diplômes, compétences, hobbies, certifs) ;
// structurel conservé (icônes, couleurs, URLs, logos, dates, entreprises, écoles).
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY non configurée" }, { status: 503 });
  }

  const raw = new URL(req.url).searchParams.get("lang");
  const target = raw ? parseLang(raw) : "en";
  if (target === "fr") return NextResponse.json({ error: "Langue cible invalide" }, { status: 400 });

  const fr = readProfile("fr");

  try {
    const fields: Record<string, string> = {
      desc: fr.identity.description,
      summary: fr.identity.summary,
    };
    fr.work.forEach((w, i) => {
      fields[`w${i}_title`] = w.title;
      fields[`w${i}_desc`] = w.description;
      w.badges.forEach((b, j) => (fields[`w${i}_b${j}`] = b));
    });
    fr.education.forEach((e, i) => (fields[`e${i}_deg`] = e.degree));
    fr.skills.forEach((s, i) => (fields[`s${i}`] = s.name));
    fr.hobbies.forEach((h, i) => (fields[`h${i}`] = h.name));
    fr.certifications.forEach((c, i) => {
      fields[`c${i}_name`] = c.name;
      fields[`c${i}_iss`] = c.issuer;
    });

    const tr = await translateFields(fields, target);
    const pick = (key: string, fallback: string) => tr[key] ?? fallback;

    const en: Profile = {
      identity: {
        ...fr.identity,
        description: pick("desc", fr.identity.description),
        summary: pick("summary", fr.identity.summary),
      },
      work: fr.work.map((w, i) => ({
        ...w,
        title: pick(`w${i}_title`, w.title),
        description: pick(`w${i}_desc`, w.description),
        badges: w.badges.map((b, j) => pick(`w${i}_b${j}`, b)),
      })),
      education: fr.education.map((e, i) => ({ ...e, degree: pick(`e${i}_deg`, e.degree) })),
      certifications: fr.certifications.map((c, i) => ({
        ...c,
        name: pick(`c${i}_name`, c.name),
        issuer: pick(`c${i}_iss`, c.issuer),
      })),
      skills: fr.skills.map((s, i) => ({ ...s, name: pick(`s${i}`, s.name) })),
      hobbies: fr.hobbies.map((h, i) => ({ ...h, name: pick(`h${i}`, h.name) })),
    };

    writeProfile(en, target);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Translate profile error:", err);
    return NextResponse.json({ error: "Erreur de traduction" }, { status: 500 });
  }
}
