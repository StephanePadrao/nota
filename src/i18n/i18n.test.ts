import { describe, it, expect } from "vitest";
import { entryLang, baseSlug, entriesForLang } from "./content";
import { localizeHref, stripLangPrefix, localeUrl } from "./ui";

describe("content i18n helpers", () => {
  it("entryLang detects the en/ subfolder", () => {
    expect(entryLang("sensiair")).toBe("fr");
    expect(entryLang("en/sensiair")).toBe("en");
  });

  it("baseSlug strips the en/ prefix only", () => {
    expect(baseSlug("en/sensiair")).toBe("sensiair");
    expect(baseSlug("sensiair")).toBe("sensiair");
  });

  it("FR listing excludes en/ entries", () => {
    const all = [{ id: "a" }, { id: "b" }, { id: "en/a" }];
    const fr = entriesForLang(all, "fr");
    expect(fr.map((e) => e.slug).sort()).toEqual(["a", "b"]);
    expect(fr.every((e) => !e.entry.id.startsWith("en/"))).toBe(true);
  });

  it("EN listing uses the translation when present and falls back to FR otherwise", () => {
    const all = [{ id: "a" }, { id: "b" }, { id: "en/a" }];
    const bySlug = Object.fromEntries(entriesForLang(all, "en").map((e) => [e.slug, e.entry.id]));
    expect(bySlug["a"]).toBe("en/a"); // translated
    expect(bySlug["b"]).toBe("b"); // FR fallback
  });

  it("never surfaces an en/ entry that has no FR base", () => {
    const all = [{ id: "a" }, { id: "en/a" }, { id: "en/orphan" }];
    expect(entriesForLang(all, "fr").map((e) => e.slug)).toEqual(["a"]);
    expect(entriesForLang(all, "en").map((e) => e.slug)).toEqual(["a"]);
  });
});

describe("url helpers", () => {
  it("localizeHref keeps FR at root and prefixes EN", () => {
    expect(localizeHref("/", "fr")).toBe("/");
    expect(localizeHref("/projects", "fr")).toBe("/projects");
    expect(localizeHref("/", "en")).toBe("/en");
    expect(localizeHref("/projects", "en")).toBe("/en/projects");
  });

  it("stripLangPrefix returns the canonical FR path", () => {
    expect(stripLangPrefix("/en")).toBe("/");
    expect(stripLangPrefix("/en/projects/x")).toBe("/projects/x");
    expect(stripLangPrefix("/projects/x")).toBe("/projects/x");
    expect(stripLangPrefix("/")).toBe("/");
  });

  it("localeUrl is absolute and trailing-slashed (matches Astro output)", () => {
    const site = "https://spadrao.erro.cloud";
    expect(localeUrl("/", "fr", site)).toBe("https://spadrao.erro.cloud/");
    expect(localeUrl("/", "en", site)).toBe("https://spadrao.erro.cloud/en/");
    expect(localeUrl("/projects/x", "fr", site)).toBe("https://spadrao.erro.cloud/projects/x/");
    expect(localeUrl("/projects/x", "en", site)).toBe("https://spadrao.erro.cloud/en/projects/x/");
  });
});
