import { NextResponse } from "next/server";
import { listArticles, saveArticle } from "@/lib/articles";

export async function GET() {
  return NextResponse.json(listArticles());
}

export async function POST(request: Request) {
  const { slug, ...article } = await request.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  saveArticle(slug, article);
  return NextResponse.json({ ok: true });
}
