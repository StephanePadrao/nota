import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { DEFAULT_LANG, type Lang } from "./i18n";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export const ALBUMS_DIR = path.join(NOTA_ROOT, "src/content/albums");

function safeSlug(slug: string) {
  if (slug.includes("/") || slug.includes("..") || slug.includes("\\"))
    throw new Error("Invalid slug");
}

// FR canonique à la racine ; EN dans le sous-dossier `en/`.
function dirFor(lang: Lang) {
  return lang === "en" ? path.join(ALBUMS_DIR, "en") : ALBUMS_DIR;
}
function fileFor(slug: string, lang: Lang) {
  safeSlug(slug);
  return path.join(dirFor(lang), `${slug}.mdx`);
}

export interface AlbumPhoto {
  src: string;
  alt: string;
}

export interface AlbumMeta {
  slug: string;
  title: string;
  date: string;
  location?: string;
  cover: string;
  summary?: string;
  photoCount: number;
}

export interface Album extends AlbumMeta {
  photos: AlbumPhoto[];
  body: string;
}

export function listAlbums(): AlbumMeta[] {
  if (!fs.existsSync(ALBUMS_DIR)) return [];
  return fs
    .readdirSync(ALBUMS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => {
      const slug = f.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(ALBUMS_DIR, f), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        location: data.location ? String(data.location) : undefined,
        cover: String(data.cover ?? ""),
        summary: data.summary ? String(data.summary) : undefined,
        photoCount: Array.isArray(data.photos) ? data.photos.length : 0,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAlbum(slug: string, lang: Lang = DEFAULT_LANG): Album | null {
  const filePath = fileFor(slug, lang);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: body } = matter(raw);
  return {
    slug,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    location: data.location ? String(data.location) : undefined,
    cover: String(data.cover ?? ""),
    summary: data.summary ? String(data.summary) : undefined,
    photoCount: Array.isArray(data.photos) ? data.photos.length : 0,
    photos: Array.isArray(data.photos) ? data.photos : [],
    body,
  };
}

export function saveAlbum(slug: string, album: Omit<Album, "slug" | "photoCount">, lang: Lang = DEFAULT_LANG): void {
  const dir = dirFor(lang);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = fileFor(slug, lang);
  const frontmatter: Record<string, unknown> = {
    title: album.title,
    date: album.date,
    cover: album.cover,
    photos: album.photos,
  };
  if (album.location) frontmatter.location = album.location;
  if (album.summary) frontmatter.summary = album.summary;
  const fileContent = matter.stringify(album.body.trim(), frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");
}

export function deleteAlbum(slug: string, lang: Lang = DEFAULT_LANG): void {
  const filePath = fileFor(slug, lang);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
