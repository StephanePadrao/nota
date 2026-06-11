import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPost, savePost, deletePost } from "@/lib/blog";
import { parseLang } from "@/lib/i18n";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const lang = parseLang(new URL(req.url).searchParams.get("lang"));
  const post = getPost(slug, lang);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const lang = parseLang(new URL(req.url).searchParams.get("lang"));
  const data = await req.json();
  savePost(slug, data, lang);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const lang = parseLang(new URL(req.url).searchParams.get("lang"));
  deletePost(slug, lang);
  // Supprimer le FR retire aussi sa traduction EN (pas d'orphelin).
  if (lang === "fr") deletePost(slug, "en");
  return NextResponse.json({ ok: true });
}
