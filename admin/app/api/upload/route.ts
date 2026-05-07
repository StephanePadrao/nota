import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const uploadDir = path.join(NOTA_ROOT, "public/blog");
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filePath, buffer);

  return NextResponse.json({ url: `/blog/${safeName}` });
}
