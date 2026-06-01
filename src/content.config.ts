import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: ["**/*.mdx", "!**/_*.mdx"], base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    dates: z.string(),
    active: z.boolean().default(true),
    description: z.string(),
    technologies: z.array(z.string()),
    links: z.array(z.object({ type: z.string(), href: z.string() })).optional(),
    cover: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

const albums = defineCollection({
  loader: glob({ pattern: ["**/*.mdx", "!**/_*.mdx"], base: "./src/content/albums" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    location: z.string().optional(),
    cover: z.string(),
    summary: z.string().optional(),
    photos: z.array(z.object({ src: z.string(), alt: z.string() })),
  }),
});

export const collections = { projects, albums };
