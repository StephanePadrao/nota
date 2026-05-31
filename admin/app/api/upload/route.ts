import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import path from "path";
import sharp from "sharp";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export async function POST(request: Request) {
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

  const uploadDir = path.join(NOTA_ROOT, "public", folder);
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  const baseName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
  const safeName = `${baseName}.webp`;
  const filePath = path.join(uploadDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
  writeFileSync(filePath, webpBuffer);

  return NextResponse.json({ url: `/${folder}/${safeName}` });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

  if (!imagePath || imagePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(NOTA_ROOT, "public", imagePath);

  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  return NextResponse.json({ ok: true });
}
