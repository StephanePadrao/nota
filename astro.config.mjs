// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { CONFIG } from "./src/data/config.ts";

export default defineConfig({
  site: CONFIG.site.url,
  output: "static",

  build: {
    inlineStylesheets: "always",
  },

  vite: { plugins: [tailwindcss()] },

  integrations: [react(), sitemap()],
});
