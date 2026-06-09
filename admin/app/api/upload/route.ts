import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import path from "path";
import sharp from "sharp";
import { auth } from "@/auth";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);
const MAX_BYTES = 15 * 1024 * 1024; // 15 Mo

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") ?? "blog";

  // Sanitize folder: only allow alphanum, dash, slash (no traversal)
  if (!/^[a-zA-Z0-9/_-]+$/.test(folder) || folder.includes("..")) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé (image attendue)" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 15 Mo)" }, { status: 413 });
  }

  const uploadDir = path.join(NOTA_ROOT, "public", folder);
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  const baseName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
  const safeName = `${baseName}.webp`;
  const filePath = path.join(uploadDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
    writeFileSync(filePath, webpBuffer);
  } catch (err) {
    console.error("Upload sharp error:", err);
    return NextResponse.json({ error: "Image invalide ou illisible" }, { status: 400 });
  }

  return NextResponse.json({ url: `/${folder}/${safeName}` });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

  if (!imagePath || imagePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(NOTA_ROOT, "public", imagePath);
  // Défense en profondeur : refuser toute cible hors de public/.
  const publicDir = path.join(NOTA_ROOT, "public");
  if (!filePath.startsWith(publicDir + path.sep)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  return NextResponse.json({ ok: true });
}
