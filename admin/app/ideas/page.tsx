"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import type { Idea, IdeaStage } from "@/lib/ideas";

const STAGES: { id: IdeaStage; label: string; emoji: string; placeholder: string; color: string }[] = [
  { id: "idee", label: "Idée", emoji: "💡", placeholder: "Décris l'idée brute, l'angle possible, pourquoi ça t'intéresse...", color: "zinc" },
  { id: "preparation", label: "Préparation", emoji: "📋", placeholder: "Sources, références, angle éditorial, structure prévue...", color: "blue" },
  { id: "redaction", label: "Rédaction", emoji: "✏️", placeholder: "Premier jet, points clés à développer, citations...", color: "amber" },
  { id: "revision", label: "Révision", emoji: "👀", placeholder: "Notes de relecture, passages à améliorer, vérifications...", color: "orange" },
  { id: "pret", label: "Prêt", emoji: "✅", placeholder: "Notes finales, checklist avant publication...", color: "green" },
];

const STAGE_INDEX: Record<IdeaStage, number> = {
  idee: 0, preparation: 1, redaction: 2, revision: 3, pret: 4,
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeStage, setActiveStage] = useState<IdeaStage>("idee");
  const [newTitle, setNewTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch("/api/ideas").then((r) => r.json()).then(setIdeas);
  }, []);

  const stageIdeas = ideas.filter((i) => i.stage === activeStage);
  const stage = STAGES.find((s) => s.id === activeStage)!;

  async function addIdea() {
    const title = newTitle.trim();
    if (!title) return;
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, stage: activeStage }),
    });
    const idea = await res.json();
    setIdeas((prev) => [...prev, idea]);
    setNewTitle("");
    setExpandedId(idea.id);
  }

  const scheduleSave = useCallback((id: string, updates: Partial<Idea>) => {
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    }, 800);
  }, []);

  function updateLocal(id: string, updates: Partial<Idea>) {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    scheduleSave(id, updates);
  }

  async function moveStage(id: string, direction: 1 | -1) {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const currentIdx = STAGE_INDEX[idea.stage];
    const nextIdx = currentIdx + direction;
    if (nextIdx < 0 || nextIdx >= STAGES.length) return;
    const newStage = STAGES[nextIdx].id;
    await fetch(`/api/ideas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, stage: newStage } : i)));
  }

  async function deleteIdea(id: string) {
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function convertToArticle(idea: Idea) {
    const slugBase = idea.title.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = slugBase || `article-${Date.now()}`;
    await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title: idea.title,
        publishedAt: new Date().toISOString().split("T")[0],
        summary: "",
        image: "",
        body: idea.notes ? `<!-- Notes: ${idea.notes.slice(0, 200)} -->` : "",
        draft: true,
      }),
    });
    router.push(`/articles/${slug}`);
  }

  return (
    <DashboardShell>
      <div className="p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Idées éditoriales</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {ideas.length} idée{ideas.length !== 1 ? "s" : ""}
              {STAGES.map((s) => {
                const count = ideas.filter((i) => i.stage === s.id).length;
                return count > 0 ? (
                  <span key={s.id} className="ml-2">· {s.emoji} {count}</span>
                ) : null;
              })}
            </p>
          </div>
        </div>

        {/* Stage tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white border border-zinc-200 rounded-xl p-1">
          {STAGES.map((s) => {
            const count = ideas.filter((i) => i.stage === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeStage === s.id
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <span>{s.emoji}</span>
                <span className="hidden sm:inline">{s.label}</span>
                {count > 0 && (
                  <span className="text-xs bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-full font-semibold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add idea form */}
        <form
          onSubmit={(e) => { e.preventDefault(); addIdea(); }}
          className="flex gap-2 mb-5"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Ajouter une idée dans "${stage.label}"...`}
            className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-40 transition-colors"
          >
            Ajouter
          </button>
        </form>

        {/* Ideas list */}
        <div className="space-y-3">
          {stageIdeas.length === 0 && (
            <div className="text-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
              <p className="text-2xl mb-2">{stage.emoji}</p>
              <p className="text-sm">Aucune idée dans "{stage.label}"</p>
              <p className="text-xs mt-1">Commence par ajouter une idée ci-dessus</p>
            </div>
          )}

          {stageIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              stage={stage}
              stages={STAGES}
              expanded={expandedId === idea.id}
              onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              onUpdate={(updates) => updateLocal(idea.id, updates)}
              onMove={(dir) => moveStage(idea.id, dir)}
              onDelete={() => deleteIdea(idea.id)}
              onConvert={() => convertToArticle(idea)}
              isFirst={STAGE_INDEX[idea.stage] === 0}
              isLast={STAGE_INDEX[idea.stage] === STAGES.length - 1}
            />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

interface CardProps {
  idea: Idea;
  stage: typeof STAGES[0];
  stages: typeof STAGES;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (u: Partial<Idea>) => void;
  onMove: (dir: 1 | -1) => void;
  onDelete: () => void;
  onConvert: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function IdeaCard({ idea, stage, expanded, onToggle, onUpdate, onMove, onDelete, onConvert, isFirst, isLast }: CardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [expanded]);

  function handleNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    onUpdate({ notes: e.target.value });
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-zinc-300 transition-colors">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onToggle} className="flex-1 text-left">
          <span className="font-medium text-zinc-900 text-sm">{idea.title || "Sans titre"}</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {!isFirst && (
            <button
              onClick={() => onMove(-1)}
              className="p-1 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
              title="Étape précédente"
            >
              ←
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMove(1)}
              className="p-1 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
              title="Étape suivante"
            >
              →
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
          >
            <svg className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded writing zone */}
      {expanded && (
        <div className="border-t border-zinc-100 px-4 pb-4">
          <input
            type="text"
            value={idea.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Titre de l'idée"
            className="w-full text-base font-medium text-zinc-900 placeholder:text-zinc-300 bg-transparent border-none outline-none py-3"
          />
          <textarea
            ref={textareaRef}
            value={idea.notes}
            onChange={handleNotesChange}
            placeholder={stage.placeholder}
            rows={4}
            className="w-full text-sm text-zinc-700 placeholder:text-zinc-300 bg-transparent border-none outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
            <span className="text-xs text-zinc-300">
              Créé le {idea.createdAt}
              {idea.updatedAt !== idea.createdAt && ` · modifié le ${idea.updatedAt}`}
            </span>
            <div className="flex items-center gap-2">
              {isLast && (
                <button
                  onClick={onConvert}
                  className="px-3 py-1.5 text-xs bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Créer un brouillon →
                </button>
              )}
              <button
                onClick={onDelete}
                className="px-2 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
