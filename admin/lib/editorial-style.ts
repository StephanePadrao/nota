import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

const STYLE_FILE = path.join(NOTA_ROOT, "editorial-style.json");

export interface EditorialStyle {
  voice: {
    persona: string;
    auto_extracted_samples: string[];
  };
  inspirations: Array<{
    name: string;
    pattern: string;
    avoid: string;
  }>;
  seo_rules: {
    title_length: string;
    keyword_position: string;
    title_formula: string;
    meta_description_length: string;
  };
}

const DEFAULT_STYLE: EditorialStyle = {
  voice: {
    persona: "Auteur tech, ton direct et concret, phrases courtes, pas de jargon corporate.",
    auto_extracted_samples: [],
  },
  inspirations: [],
  seo_rules: {
    title_length: "50-60 caractères",
    keyword_position: "Dans les 3 premiers mots du titre",
    title_formula: "Tension + promesse OU Chiffre + bénéfice clair",
    meta_description_length: "150-160 caractères",
  },
};

export function readEditorialStyle(): EditorialStyle {
  if (!existsSync(STYLE_FILE)) return DEFAULT_STYLE;
  try {
    return JSON.parse(readFileSync(STYLE_FILE, "utf8")) as EditorialStyle;
  } catch {
    return DEFAULT_STYLE;
  }
}

export function writeEditorialStyle(data: EditorialStyle): void {
  writeFileSync(STYLE_FILE, JSON.stringify(data, null, 2));
}
