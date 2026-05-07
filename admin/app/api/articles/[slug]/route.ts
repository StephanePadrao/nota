import { NextResponse } from "next/server";
import { getArticle, saveArticle, deleteArticle } from "@/lib/articles";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: Context) {
  const { slug } = await params;
  const article = await request.json();
  saveArticle(slug, article);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Context) {
  const { slug } = await params;
  deleteArticle(slug);
  return NextResponse.json({ ok: true });
}
