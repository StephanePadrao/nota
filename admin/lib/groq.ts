import Groq from "groq-sdk";
import { readEditorialStyle } from "./editorial-style";

function getClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY non configurée");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export function buildSystemPrompt(): string {
  const style = readEditorialStyle();
  const samples = style.voice.auto_extracted_samples
    .map((s) => `- "${s}"`)
    .join("\n");
  const inspirations = style.inspirations
    .map((i) => `${i.name} : ${i.pattern}. Éviter : ${i.avoid}`)
    .join("\n");

  return `Tu es un assistant éditorial personnel pour un auteur dont le profil est :
${style.voice.persona}

Exemples représentatifs de son style d'écriture :
${samples || "- Aucun exemple fourni."}

${inspirations ? `Inspirations structurelles :\n${inspirations}` : ""}

Règles SEO :
- Longueur du titre : ${style.seo_rules.title_length}
- Mot-clé en position : ${style.seo_rules.keyword_position}
- Formule recommandée : ${style.seo_rules.title_formula}
- Méta-description : ${style.seo_rules.meta_description_length}

Instructions CRITIQUES :
- Réponds toujours en français.
- Respecte le ton de l'auteur — direct, concret, sans jargon.
- Ne génère jamais un article complet non demandé.
- Pour les corrections : retourne uniquement le texte corrigé, rien d'autre.
- Pour les titres : retourne uniquement le JSON, rien d'autre.`;
}

export async function callGroq(
  userMessage: string,
  useWebSearch = false
): Promise<string> {
  const groq = getClient();
  const model = useWebSearch ? "compound-beta" : "llama-3.3-70b-versatile";
  const response = await groq.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}
