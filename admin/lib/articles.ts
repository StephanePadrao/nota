import path from "path";
import fs from "fs";
import matter from "gray-matter";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export const BLOG_DIR = path.join(NOTA_ROOT, "src/content/blog");
export const PUBLIC_DIR = path.join(NOTA_ROOT, "public");

export interface ArticleMeta {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
}

export interface Article extends ArticleMeta {
  body: string;
}

function safeSlug(slug: string) {
  if (slug.includes("/") || slug.includes("..") || slug.includes("\\"))
    throw new Error("Invalid slug");
}

export function listArticles(): ArticleMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => {
      const slug = f.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        publishedAt: String(data.publishedAt ?? ""),
        summary: String(data.summary ?? ""),
        image: data.image ? String(data.image) : undefined,
      };
    })
    .sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1));
}

export function getArticle(slug: string): Article | null {
  safeSlug(slug);
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: body } = matter(raw);
  return {
    slug,
    title: String(data.title ?? ""),
    publishedAt: String(data.publishedAt ?? ""),
    summary: String(data.summary ?? ""),
    image: data.image ? String(data.image) : undefined,
    body,
  };
}

export function saveArticle(slug: string, article: Omit<Article, "slug">): void {
  safeSlug(slug);
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const frontmatter: Record<string, string> = {
    title: article.title,
    publishedAt: article.publishedAt,
    summary: article.summary,
  };
  if (article.image) frontmatter.image = article.image;
  const fileContent = matter.stringify(article.body.trim(), frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");
}

export function deleteArticle(slug: string): void {
  safeSlug(slug);
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
