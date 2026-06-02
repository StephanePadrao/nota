import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { callGroq } from "@/lib/groq";

const ACTIONS = ["correct", "rewrite", "shorten"] as const;
type Action = (typeof ACTIONS)[number];

function contextLabel(context?: string): string {
  if (context === "project") return "cette description de projet (portfolio)";
  if (context === "voyage") return "ce résumé de carnet de voyage";
  return "ce texte";
}

function buildPrompt(action: Action, text: string, context?: string): string {
  const target = contextLabel(context);
  switch (action) {
    case "correct":
      return `Corrige l'orthographe, la grammaire et améliore la fluidité de ${target}, sans changer le fond ni la voix de l'auteur. Retourne UNIQUEMENT le texte corrigé :\n\n${text}`;
    case "rewrite":
      return `Reformule ${target} dans la voix de l'auteur (direct, concret, sans jargon). Garde une longueur similaire (±15%). Retourne UNIQUEMENT le texte reformulé :\n\n${text}`;
    case "shorten":
      return `Condense ${target} en 1 à 2 phrases percutantes, prêtes à servir de description courte. Retourne UNIQUEMENT le texte condensé :\n\n${text}`;
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

  const { text, context } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Texte requis" }, { status: 400 });
  }

  try {
    const result = await callGroq(buildPrompt(action as Action, text, context));
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
