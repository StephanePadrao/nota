import path from "path";
import fs from "fs";
import matter from "gray-matter";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export const PROJECTS_DIR = path.join(NOTA_ROOT, "src/content/projects");

function safeSlug(slug: string) {
  if (slug.includes("/") || slug.includes("..") || slug.includes("\\"))
    throw new Error("Invalid slug");
}

export interface ProjectLink {
  type: string;
  href: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  dates: string;
  active: boolean;
  description: string;
  technologies: string[];
  links?: ProjectLink[];
  cover?: string;
  images?: string[];
}

export interface Project extends ProjectMeta {
  body: string;
}

export function listProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => {
      const slug = f.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, f), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        dates: String(data.dates ?? ""),
        active: data.active !== false,
        description: String(data.description ?? ""),
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        links: Array.isArray(data.links) ? data.links : undefined,
        cover: data.cover ? String(data.cover) : undefined,
        images: Array.isArray(data.images) ? data.images : undefined,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getProject(slug: string): Project | null {
  safeSlug(slug);
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: body } = matter(raw);
  return {
    slug,
    title: String(data.title ?? ""),
    dates: String(data.dates ?? ""),
    active: data.active !== false,
    description: String(data.description ?? ""),
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    links: Array.isArray(data.links) ? data.links : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    images: Array.isArray(data.images) ? data.images : undefined,
    body,
  };
}

export function saveProject(slug: string, project: Omit<Project, "slug">): void {
  safeSlug(slug);
  if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  const frontmatter: Record<string, unknown> = {
    title: project.title,
    dates: project.dates,
    active: project.active,
    description: project.description,
    technologies: project.technologies,
  };
  if (project.links?.length) frontmatter.links = project.links;
  if (project.cover) frontmatter.cover = project.cover;
  if (project.images?.length) frontmatter.images = project.images;
  const fileContent = matter.stringify(project.body.trim(), frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");
}

export function deleteProject(slug: string): void {
  safeSlug(slug);
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
