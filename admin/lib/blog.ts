import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { DEFAULT_LANG, type Lang } from "./i18n";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export const BLOG_DIR = path.join(NOTA_ROOT, "src/content/blog");

export function safeSlug(slug: string) {
  if (slug.includes("/") || slug.includes("..") || slug.includes("\\"))
    throw new Error("Invalid slug");
}

// FR canonique à la racine ; EN dans le sous-dossier `en/`.
function dirFor(lang: Lang) {
  return lang === "en" ? path.join(BLOG_DIR, "en") : BLOG_DIR;
}
function fileFor(slug: string, lang: Lang) {
  safeSlug(slug);
  return path.join(dirFor(lang), `${slug}.mdx`);
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  cover?: string;
  tags: string[];
  draft: boolean;
}

export interface Post extends PostMeta {
  body: string;
}

export function listPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => {
      const slug = f.replace(".mdx", "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, f), "utf-8"));
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        description: String(data.description ?? ""),
        cover: data.cover ? String(data.cover) : undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        draft: data.draft === true,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string, lang: Lang = DEFAULT_LANG): Post | null {
  const filePath = fileFor(slug, lang);
  if (!fs.existsSync(filePath)) return null;
  const { data, content: body } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    slug,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    description: String(data.description ?? ""),
    cover: data.cover ? String(data.cover) : undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: data.draft === true,
    body,
  };
}

export function savePost(slug: string, post: Omit<Post, "slug">, lang: Lang = DEFAULT_LANG): void {
  const dir = dirFor(lang);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const frontmatter: Record<string, unknown> = {
    title: post.title,
    date: post.date,
    description: post.description,
  };
  if (post.cover) frontmatter.cover = post.cover;
  frontmatter.tags = post.tags;
  frontmatter.draft = post.draft;
  fs.writeFileSync(fileFor(slug, lang), matter.stringify(post.body.trim(), frontmatter), "utf-8");
}

export function deletePost(slug: string, lang: Lang = DEFAULT_LANG): void {
  const filePath = fileFor(slug, lang);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
