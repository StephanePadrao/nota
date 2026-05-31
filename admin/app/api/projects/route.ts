import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listProjects, saveProject } from "@/lib/projects";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(listProjects());
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, ...data } = await req.json();
  if (!slug) return NextResponse.json({ error: "Slug requis" }, { status: 400 });
  saveProject(slug, data);
  return NextResponse.json({ ok: true });
}
