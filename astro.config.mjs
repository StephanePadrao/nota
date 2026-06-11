// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkCodeMeta } from "./src/lib/remark-code-meta.ts";
import { CONFIG } from "./src/data/config.ts";

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
};

export default defineConfig({
  site: CONFIG.site.url,
  output: "static",

  // FR à la racine, EN/ES/PT préfixés (/en, /es, /pt). Pas de redirection forcée du défaut.
  i18n: {
    locales: ["fr", "en", "es", "pt"],
    defaultLocale: "fr",
    routing: { prefixDefaultLocale: false },
  },

  build: {
    inlineStylesheets: "always",
  },

  vite: { plugins: [tailwindcss()] },

  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkGfm, remarkCodeMeta],
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      syntaxHighlight: false,
    }),
    sitemap({
      // Codes alignés sur les balises hreflang du HTML (fr/en/es/pt).
      i18n: {
        defaultLocale: "fr",
        locales: { fr: "fr", en: "en", es: "es", pt: "pt" },
      },
    }),
  ],

  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkGfm, remarkCodeMeta],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
});
