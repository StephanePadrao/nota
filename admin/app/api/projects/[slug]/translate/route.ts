import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProject, saveProject } from "@/lib/projects";
import { translateText, translateFields } from "@/lib/groq";
import { parseLang } from "@/lib/i18n";

// Traduit le projet FR canonique → écrit la variante de la locale cible (?lang=en|es|pt).
// Prose traduite (titre, description, dates, corps) ; champs structurels conservés
// (technologies, liens, images, statut actif).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY non configurée" }, { status: 503 });
  }

  const { slug } = await params;
  const raw = new URL(req.url).searchParams.get("lang");
  const target = raw ? parseLang(raw) : "en";
  if (target === "fr") return NextResponse.json({ error: "Langue cible invalide" }, { status: 400 });

  const fr = getProject(slug, "fr");
  if (!fr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const fields = await translateFields(
      { title: fr.title, description: fr.description, dates: fr.dates },
      target
    );
    const body = await translateText(fr.body, target);

    saveProject(
      slug,
      {
        title: fields.title ?? fr.title,
        description: fields.description ?? fr.description,
        dates: fields.dates ?? fr.dates,
        active: fr.active,
        technologies: fr.technologies,
        links: fr.links,
        cover: fr.cover,
        images: fr.images,
        body,
      },
      target
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Translate project error:", err);
    return NextResponse.json({ error: "Erreur de traduction" }, { status: 500 });
  }
}
