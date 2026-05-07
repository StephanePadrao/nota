import { readFileSync, existsSync } from "fs";
import path from "path";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relative = segments.join("/");

  if (relative.includes("..")) {
    return new Response("Forbidden", { status: 403 });
  }

  const filePath = path.join(NOTA_ROOT, "public", relative);

  if (!existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";
  const buffer = readFileSync(filePath);

  return new Response(buffer, {
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" },
  });
}
