import { NextResponse } from "next/server";
import { listIdeas, createIdea } from "@/lib/ideas";

export async function GET() {
  return NextResponse.json(listIdeas());
}

export async function POST(request: Request) {
  const { title, stage } = await request.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const idea = createIdea(title, stage);
  return NextResponse.json(idea);
}
