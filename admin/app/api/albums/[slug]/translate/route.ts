import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAlbum, saveAlbum } from "@/lib/albums";
import { translateText, translateFields } from "@/lib/groq";

// Traduit l'album FR canonique → écrit la variante EN (en/<slug>.mdx).
// Prose traduite (titre, résumé, légendes photos, corps) ; structurel conservé
// (date, lieu, sources d'images).
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
  const fr = getAlbum(slug, "fr");
  if (!fr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const fields = await translateFields({ title: fr.title, summary: fr.summary ?? "" });
    const altInput: Record<string, string> = {};
    fr.photos.forEach((p, i) => (altInput[`alt_${i}`] = p.alt));
    const alts = await translateFields(altInput);
    const body = await translateText(fr.body);

    saveAlbum(
      slug,
      {
        title: fields.title ?? fr.title,
        date: fr.date,
        location: fr.location,
        cover: fr.cover,
        summary: fields.summary ?? fr.summary,
        photos: fr.photos.map((p, i) => ({ src: p.src, alt: alts[`alt_${i}`] ?? p.alt })),
        body,
      },
      "en"
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Translate album error:", err);
    return NextResponse.json({ error: "Erreur de traduction" }, { status: 500 });
  }
}
