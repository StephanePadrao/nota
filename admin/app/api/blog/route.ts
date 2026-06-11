import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listPosts, savePost } from "@/lib/blog";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(listPosts());
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, ...data } = await req.json();
  if (!slug) return NextResponse.json({ error: "Slug requis" }, { status: 400 });
  savePost(slug, data);
  return NextResponse.json({ ok: true });
}
