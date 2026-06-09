import Groq from "groq-sdk";
import { readEditorialStyle } from "./editorial-style";
import { type Lang } from "./i18n";

const MODEL = "llama-3.3-70b-versatile";

function getClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY non configurée");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export function buildSystemPrompt(outputLang: Lang = "fr"): string {
  const style = readEditorialStyle();
  const samples = style.voice.auto_extracted_samples
    .map((s) => `- "${s}"`)
    .join("\n");
  const inspirations = style.inspirations
    .map((i) => `${i.name} : ${i.pattern}. Éviter : ${i.avoid}`)
    .join("\n");
  const langLine =
    outputLang === "en" ? "- Always respond in English." : "- Réponds toujours en français.";

  return `Tu es l'assistant de rédaction personnel d'un auteur pour son site : fiches de projets (portfolio) et carnets de voyage (albums photo). Son profil :
${style.voice.persona}

Exemples représentatifs de son style d'écriture :
${samples || "- Aucun exemple fourni."}

${inspirations ? `Inspirations structurelles :\n${inspirations}` : ""}

Instructions CRITIQUES :
${langLine}
- Respecte la voix de l'auteur — direct, concret, sans jargon corporate.
- Tu travailles sur des textes courts (descriptions de projets, résumés de voyages), pas des articles de blog.
- Retourne UNIQUEMENT le texte demandé, sans commentaire, sans guillemets superflus, sans préambule.`;
}

export async function callGroq(
  userMessage: string,
  useWebSearch = false,
  outputLang: Lang = "fr"
): Promise<string> {
  const groq = getClient();
  const model = useWebSearch ? "compound-beta" : MODEL;
  const response = await groq.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      { role: "system", content: buildSystemPrompt(outputLang) },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

// ── Traduction FR→EN ────────────────────────────────────────────────────────
// Système dédié : préserve la voix de l'auteur ET la structure MDX. Corps et
// champs de frontmatter sont traduits séparément pour protéger la structure.

function buildTranslationSystemPrompt(): string {
  const style = readEditorialStyle();
  return `You translate the author's French portfolio content into natural, idiomatic English.
Author's voice to preserve: ${style.voice.persona}

CRITICAL RULES:
- Translate French → English. Keep the author's direct, concrete, jargon-free voice.
- Preserve Markdown/MDX structure EXACTLY: headings (#), lists, blockquotes (>), links, image syntax ![alt](url), tables, bold/italic, line breaks, frontmatter.
- NEVER translate or alter: code, fenced code-block contents and their language tags, JSX/MDX tags and attributes, import/export lines, URLs, file paths, technology names, proper nouns, function or identifier names, numbers and units.
- Inside Mermaid or other diagram code fences, translate ONLY the human-readable label text inside quotes; keep node IDs, arrows and diagram syntax intact.
- Do not add, remove or reorder content. Output ONLY the translation — no commentary, no surrounding quotes, no extra code fences.`;
}

export async function translateText(text: string): Promise<string> {
  if (!text.trim()) return "";
  const groq = getClient();
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 8192,
    messages: [
      { role: "system", content: buildTranslationSystemPrompt() },
      { role: "user", content: text },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}

// Traduit un lot de champs courts (titre, description, légendes…) en un seul appel,
// en JSON pour garantir le mapping clé→valeur sans casser la structure.
export async function translateFields(
  fields: Record<string, string>
): Promise<Record<string, string>> {
  const entries = Object.entries(fields).filter(([, v]) => v.trim());
  if (entries.length === 0) return {};
  const groq = getClient();
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          buildTranslationSystemPrompt() +
          "\n\nReturn a JSON object with EXACTLY the same keys as the input; translate each string value to English. Do not add, remove or rename keys.",
      },
      { role: "user", content: JSON.stringify(Object.fromEntries(entries)) },
    ],
  });
  return parseJsonObject(response.choices[0]?.message?.content ?? "{}");
}

export function parseJsonObject(raw: string): Record<string, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Réponse de traduction non parsable");
    parsed = JSON.parse(match[0]);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Réponse de traduction non parsable");
  }
  // Ne conserver que les valeurs string (ignore null / valeurs non textuelles).
  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).filter(([, v]) => typeof v === "string")
  ) as Record<string, string>;
}
