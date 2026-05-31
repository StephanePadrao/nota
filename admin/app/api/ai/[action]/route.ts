import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { callGroq } from "@/lib/groq";

const ACTIONS = ["correct", "rewrite", "titles", "summarize", "research"] as const;
type Action = (typeof ACTIONS)[number];

function buildPrompt(action: Action, text: string, topic?: string): { message: string; useWebSearch: boolean } {
  switch (action) {
    case "correct":
      return {
        useWebSearch: false,
        message: `Corrige les fautes d'orthographe, de grammaire et améliore la fluidité du texte suivant sans changer le fond ni le style de l'auteur. Retourne UNIQUEMENT le texte corrigé, sans commentaire ni explication :\n\n${text}`,
      };
    case "rewrite":
      return {
        useWebSearch: false,
        message: `Reformule le texte suivant dans le ton et le style de l'auteur. Longueur finale : ±10% de l'original. Retourne UNIQUEMENT le texte reformulé :\n\n${text}`,
      };
    case "titles":
      return {
        useWebSearch: false,
        message: `Propose 3 titres SEO pour l'article suivant en respectant les règles SEO (longueur, formule). Retourne UNIQUEMENT un tableau JSON valide : ["titre1", "titre2", "titre3"]\n\nContenu de l'article :\n${text}`,
      };
    case "summarize":
      return {
        useWebSearch: false,
        message: `Génère un résumé de 1-2 phrases (150-160 caractères maximum) pour cet article. Ce résumé sera utilisé comme meta description SEO. Retourne UNIQUEMENT le résumé, sans guillemets :\n\n${text}`,
      };
    case "research":
      return {
        useWebSearch: true,
        message: `Effectue une recherche sur le sujet suivant et retourne 3 à 5 faits récents, précis et sourcés en Markdown (avec liens si disponibles). Format : liste à puces avec source entre parenthèses.\n\nSujet : ${topic ?? text}`,
      };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await params;
  if (!ACTIONS.includes(action as Action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY non configurée" }, { status: 503 });
  }

  const { text, topic } = await req.json();
  if (!text && !topic) {
    return NextResponse.json({ error: "Texte requis" }, { status: 400 });
  }

  try {
    const { message, useWebSearch } = buildPrompt(action as Action, text ?? "", topic);
    const result = await callGroq(message, useWebSearch);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
