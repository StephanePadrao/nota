import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

const IDEAS_FILE = path.join(NOTA_ROOT, "ideas.json");

export type IdeaStage = "idee" | "preparation" | "redaction" | "revision" | "pret";

export interface Idea {
  id: string;
  title: string;
  stage: IdeaStage;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function listIdeas(): Idea[] {
  if (!fs.existsSync(IDEAS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8")) as Idea[];
  } catch {
    return [];
  }
}

function persistIdeas(ideas: Idea[]): void {
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2), "utf-8");
}

export function createIdea(title: string, stage: IdeaStage = "idee"): Idea {
  const ideas = listIdeas();
  const today = new Date().toISOString().split("T")[0];
  const idea: Idea = { id: randomUUID(), title, stage, notes: "", createdAt: today, updatedAt: today };
  ideas.push(idea);
  persistIdeas(ideas);
  return idea;
}

export function updateIdea(id: string, updates: Partial<Omit<Idea, "id" | "createdAt">>): Idea | null {
  const ideas = listIdeas();
  const idx = ideas.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  ideas[idx] = { ...ideas[idx], ...updates, updatedAt: new Date().toISOString().split("T")[0] };
  persistIdeas(ideas);
  return ideas[idx];
}

export function deleteIdea(id: string): void {
  persistIdeas(listIdeas().filter((i) => i.id !== id));
}
