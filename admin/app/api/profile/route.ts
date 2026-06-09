import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readProfile, writeProfile, type Profile } from "@/lib/profile";
import { parseLang } from "@/lib/i18n";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lang = parseLang(new URL(req.url).searchParams.get("lang"));
  return NextResponse.json(readProfile(lang));
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lang = parseLang(new URL(req.url).searchParams.get("lang"));
  const data = (await req.json()) as Profile;
  if (!data || typeof data !== "object" || typeof data.identity !== "object") {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  writeProfile(data, lang);
  return NextResponse.json({ ok: true });
}
