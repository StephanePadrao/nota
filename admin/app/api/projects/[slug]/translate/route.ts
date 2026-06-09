import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProject, saveProject } from "@/lib/projects";
import { translateText, translateFields } from "@/lib/groq";

// Traduit le projet FR canonique → écrit la variante EN (en/<slug>.mdx).
// Prose traduite (titre, description, dates, corps) ; champs structurels conservés
// (technologies, liens, images, statut actif).
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY non configurée" }, { status: 503 });
  }

  const { slug } = await params;
  const fr = getProject(slug, "fr");
  if (!fr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const fields = await translateFields({
      title: fr.title,
      description: fr.description,
      dates: fr.dates,
    });
    const body = await translateText(fr.body);

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
      "en"
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Translate project error:", err);
    return NextResponse.json({ error: "Erreur de traduction" }, { status: 500 });
  }
}
