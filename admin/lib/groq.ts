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

  return `Tu es l'assistant de rédaction personnel d'un auteur pour son site : fiches de projets (portfolio) et carnets de voyage (albums photo). Son profil :
${style.voice.persona}

Exemples représentatifs de son style d'écriture :
${samples || "- Aucun exemple fourni."}

${inspirations ? `Inspirations structurelles :\n${inspirations}` : ""}

Instructions CRITIQUES :
- Réponds toujours en français.
- Respecte la voix de l'auteur — direct, concret, sans jargon corporate.
- Tu travailles sur des textes courts (descriptions de projets, résumés de voyages), pas des articles de blog.
- Retourne UNIQUEMENT le texte demandé, sans commentaire, sans guillemets superflus, sans préambule.`;
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
