import { describe, it, expect } from "vitest";
import { parseJsonObject } from "./groq";
import { safeSlug } from "./projects";

describe("parseJsonObject (Groq translation responses)", () => {
  it("parses a clean JSON object", () => {
    expect(parseJsonObject('{"a":"x","b":"y"}')).toEqual({ a: "x", b: "y" });
  });

  it("extracts JSON from surrounding noise (code fences, prose)", () => {
    expect(parseJsonObject('Voici :\n```json\n{"a":"x"}\n```')).toEqual({ a: "x" });
  });

  it("drops non-string values (null, numbers)", () => {
    expect(parseJsonObject('{"a":"x","b":null,"c":3}')).toEqual({ a: "x" });
  });

  it("throws on unparsable input", () => {
    expect(() => parseJsonObject("pas du json du tout")).toThrow();
  });
});

describe("safeSlug (path traversal guard)", () => {
  it("accepts a clean slug", () => {
    expect(() => safeSlug("sensiair")).not.toThrow();
    expect(() => safeSlug("mon-projet-2024")).not.toThrow();
  });

  it("rejects traversal and separators", () => {
    expect(() => safeSlug("../etc/passwd")).toThrow();
    expect(() => safeSlug("a/b")).toThrow();
    expect(() => safeSlug("a\\b")).toThrow();
    expect(() => safeSlug("..")).toThrow();
  });
});
