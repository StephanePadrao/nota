import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readProfile, writeProfile, type Profile } from "@/lib/profile";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(readProfile());
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = (await req.json()) as Profile;
  if (!data || typeof data !== "object" || typeof data.identity !== "object") {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  writeProfile(data);
  return NextResponse.json({ ok: true });
}
