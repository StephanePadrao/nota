import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPost, savePost } from "@/lib/blog";
import { translateText, translateFields } from "@/lib/groq";

// Traduit l'article FR canonique → écrit la variante EN (en/<slug>.mdx).
// Prose traduite (titre, description, corps) ; champs structurels conservés
// (date, cover, tags, statut brouillon).
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
  const fr = getPost(slug, "fr");
  if (!fr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const fields = await translateFields({
      title: fr.title,
      description: fr.description,
    });
    const body = await translateText(fr.body);

    savePost(
      slug,
      {
        title: fields.title ?? fr.title,
        description: fields.description ?? fr.description,
        date: fr.date,
        cover: fr.cover,
        tags: fr.tags,
        draft: fr.draft,
        body,
      },
      "en"
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Translate post error:", err);
    return NextResponse.json({ error: "Erreur de traduction" }, { status: 500 });
  }
}
