import { NextResponse } from "next/server";
import { updateIdea, deleteIdea } from "@/lib/ideas";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const updates = await request.json();
  const idea = updateIdea(id, updates);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;
  deleteIdea(id);
  return NextResponse.json({ ok: true });
}
