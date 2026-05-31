import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAlbum, saveAlbum, deleteAlbum } from "@/lib/albums";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(album);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const data = await req.json();
  saveAlbum(slug, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  deleteAlbum(slug);
  return NextResponse.json({ ok: true });
}
