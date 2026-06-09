import { defineConfig } from "vitest/config";

// Tests du site uniquement (le CMS admin a sa propre config + ses propres tests).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
