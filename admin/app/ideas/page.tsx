"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import type { Idea, IdeaStage } from "@/lib/ideas";

const STAGES: { id: IdeaStage; label: string; emoji: string; placeholder: string; color: string }[] = [
  { id: "idee", label: "Idée", emoji: "💡", placeholder: "L'idée brute, l'angle, pourquoi ça t'intéresse...", color: "zinc" },
  { id: "preparation", label: "Préparation", emoji: "📋", placeholder: "Sources, angle éditorial, structure prévue...", color: "blue" },
  { id: "redaction", label: "Rédaction", emoji: "✏️", placeholder: "Premier jet, points clés, citations...", color: "amber" },
  { id: "revision", label: "Révision", emoji: "👀", placeholder: "Notes de relecture, passages à améliorer...", color: "orange" },
  { id: "pret", label: "Prêt", emoji: "✅", placeholder: "Checklist avant publication...", color: "green" },
];

const STAGE_INDEX: Record<IdeaStage, number> = {
  idee: 0, preparation: 1, redaction: 2, revision: 3, pret: 4,
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitles, setNewTitles] = useState<Record<IdeaStage, string>>({
    idee: "", preparation: "", redaction: "", revision: "", pret: "",
  });
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch("/api/ideas").then((r) => r.json()).then(setIdeas);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const selectedIdea = ideas.find((i) => i.id === selectedId) ?? null;

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

  async function addIdea(stage: IdeaStage) {
    const title = newTitles[stage].trim();
    if (!title) return;
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, stage }),
    });
    const idea = await res.json();
    setIdeas((prev) => [...prev, idea]);
    setNewTitles((prev) => ({ ...prev, [stage]: "" }));
    setSelectedId(idea.id);
  }

  async function moveStage(id: string, direction: 1 | -1) {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const nextIdx = STAGE_INDEX[idea.stage] + direction;
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
    if (selectedId === id) setSelectedId(null);
  }

  function buildArticleBody(idea: Idea): string {
    const parts: string[] = [];
    if (idea.stageNotes?.redaction) parts.push(idea.stageNotes.redaction);
    if (idea.stageNotes?.preparation)
      parts.push("\n\n---\n\n**Notes de préparation :**\n\n" + idea.stageNotes.preparation);
    if (idea.stageNotes?.pret)
      parts.push("\n\n---\n\n**Notes finales :**\n\n" + idea.stageNotes.pret);
    return parts.join("") || "";
  }

  async function convertIdea(idea: Idea) {
    const type = idea.type ?? "article";
    const slugBase = idea.title.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const prefix = type === "article" ? "article" : type === "project" ? "projet" : "album";
    const slug = slugBase || prefix + "-" + Date.now();

    if (type === "article") {
      await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: idea.title,
          publishedAt: new Date().toISOString().split("T")[0],
          summary: "",
          image: "",
          body: buildArticleBody(idea),
          draft: true,
        }),
      });
      router.push("/articles/" + slug);
    } else if (type === "project") {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: idea.title,
          dates: new Date().getFullYear() + " - Aujourd\'hui",
          active: true,
          description: "",
          technologies: [],
          links: [],
          body: buildArticleBody(idea),
        }),
      });
      router.push("/projects/" + slug);
    } else {
      await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: idea.title,
          date: new Date().toISOString().split("T")[0],
          location: "",
          summary: buildArticleBody(idea),
          photos: [],
        }),
      });
      router.push("/albums/" + slug);
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 shrink-0">
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

        {/* Kanban board */}
        <div className="flex gap-4 overflow-x-auto p-6 flex-1 items-start">
          {STAGES.map((stage) => {
            const stageIdeas = ideas.filter((i) => i.stage === stage.id);
            return (
              <div key={stage.id} className="flex flex-col min-w-[220px] w-[220px] flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{stage.emoji}</span>
                  <span className="text-sm font-semibold text-zinc-700">{stage.label}</span>
                  {stageIdeas.length > 0 && (
                    <span className="ml-auto text-xs font-semibold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
                      {stageIdeas.length}
                    </span>
                  )}
                </div>

                {/* Add idea */}
                <form
                  onSubmit={(e) => { e.preventDefault(); addIdea(stage.id); }}
                  className="mb-3"
                >
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newTitles[stage.id]}
                      onChange={(e) => setNewTitles((p) => ({ ...p, [stage.id]: e.target.value }))}
                      placeholder="+ Ajouter..."
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
                    />
                    {newTitles[stage.id].trim() && (
                      <button
                        type="submit"
                        className="px-2 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors shrink-0"
                      >
                        ↵
                      </button>
                    )}
                  </div>
                </form>

                {/* Cards */}
                <div className="space-y-2">
                  {stageIdeas.length === 0 && (
                    <div className="py-8 border-2 border-dashed border-zinc-100 rounded-xl text-center text-zinc-300 text-xs">
                      Vide
                    </div>
                  )}
                  {stageIdeas.map((idea) => (
                    <button
                      key={idea.id}
                      onClick={() => setSelectedId(idea.id === selectedId ? null : idea.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                        selectedId === idea.id
                          ? "bg-amber-50 border-amber-300 shadow-sm"
                          : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">
                        {idea.title || "Sans titre"}
                      </p>
                      {idea.targetDate && (
                        <p className="text-[10px] text-zinc-400 mt-1">
                          📅 {idea.targetDate}
                        </p>
                      )}
                      {/* Progress dots */}
                      <div className="flex gap-0.5 mt-2">
                        {STAGES.map((s, i) => (
                          <div
                            key={s.id}
                            className={`h-1 rounded-full flex-1 ${
                              i <= STAGE_INDEX[idea.stage]
                                ? "bg-amber-400"
                                : "bg-zinc-100"
                            }`}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer overlay */}
      {selectedIdea && (
        <>
          <div
            className="fixed inset-0 bg-black/10 z-40"
            onClick={() => setSelectedId(null)}
          />
          <IdeaDrawer
            idea={selectedIdea}
            stages={STAGES}
            onClose={() => setSelectedId(null)}
            onUpdate={(updates) => updateLocal(selectedIdea.id, updates)}
            onMove={(dir) => moveStage(selectedIdea.id, dir)}
            onDelete={() => deleteIdea(selectedIdea.id)}
            onTypeChange={(t) => updateLocal(selectedIdea.id, { type: t })}
            onConvert={() => convertIdea(selectedIdea)}
          />
        </>
      )}
    </DashboardShell>
  );
}

interface DrawerProps {
  idea: Idea;
  stages: typeof STAGES;
  onClose: () => void;
  onUpdate: (u: Partial<Idea>) => void;
  onMove: (dir: 1 | -1) => void;
  onDelete: () => void;
  onTypeChange: (type: "article" | "project" | "album") => void;
  onConvert: () => void;
}

function IdeaDrawer({ idea, stages, onClose, onUpdate, onMove, onDelete, onTypeChange, onConvert }: DrawerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentStageIdx = STAGE_INDEX[idea.stage];
  const currentNote = idea.stageNotes?.[idea.stage] ?? "";
  const stage = stages[currentStageIdx];
  const isFirst = currentStageIdx === 0;
  const isLast = currentStageIdx === stages.length - 1;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [idea.id]);

  function handleNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
    onUpdate({ stageNotes: { ...idea.stageNotes, [idea.stage]: e.target.value } });
  }

  const previousStagesWithNotes = stages
    .slice(0, currentStageIdx)
    .filter((s) => idea.stageNotes?.[s.id]);

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col">
      {/* Drawer header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{stage.emoji}</span>
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">{stage.label}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Title + date */}
        <div className="flex items-start gap-3 mb-5">
          <input
            type="text"
            value={idea.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Titre de l'idée"
            className="flex-1 text-lg font-semibold text-zinc-900 placeholder:text-zinc-300 bg-transparent border-none outline-none"
          />
          <input
            type="date"
            value={idea.targetDate ?? ""}
            onChange={(e) => onUpdate({ targetDate: e.target.value || undefined })}
            title="Date cible"
            className="text-xs text-zinc-400 bg-transparent border border-zinc-200 rounded-lg px-2 py-1 outline-none hover:border-zinc-300 focus:border-amber-400 transition-colors mt-1"
          />
        </div>


        {/* Type selector */}
        <div className="flex gap-1.5 mb-5">
          {(["article", "project", "album"] as const).map((t) => {
            const labels: Record<string, string> = { article: "✍️ Article", project: "🔧 Projet", album: "📷 Voyage" };
            const active = (idea.type ?? "article") === t;
            return (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  active
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>
        {/* Stage navigation */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="px-2.5 py-1 text-xs border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← {!isFirst && stages[currentStageIdx - 1].label}
          </button>
          <div className="flex gap-1 flex-1 justify-center">
            {stages.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full flex-1 ${i <= currentStageIdx ? "bg-amber-400" : "bg-zinc-100"}`}
              />
            ))}
          </div>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="px-2.5 py-1 text-xs border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {!isLast && stages[currentStageIdx + 1].label} →
          </button>
        </div>

        {/* Previous stages notes — read only */}
        {previousStagesWithNotes.length > 0 && (
          <div className="space-y-3 mb-5">
            {previousStagesWithNotes.map((s) => (
              <div key={s.id} className="rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs">{s.emoji}</span>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-sm text-zinc-500 whitespace-pre-wrap leading-relaxed">{idea.stageNotes![s.id]}</p>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-xs text-zinc-400 shrink-0">{stage.emoji} {stage.label}</span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>
          </div>
        )}

        {/* Current stage — editable */}
        <textarea
          ref={textareaRef}
          value={currentNote}
          onChange={handleNotesChange}
          placeholder={stage.placeholder}
          rows={6}
          className="w-full text-sm text-zinc-700 placeholder:text-zinc-300 bg-transparent border-none outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Footer actions */}
      <div className="shrink-0 px-5 py-4 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-xs text-zinc-300">
          Créé le {idea.createdAt}
        </p>
        <div className="flex items-center gap-2">
          {isLast && (
            <button
              onClick={onConvert}
              className="px-3 py-1.5 text-xs bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              {idea.type === "project" ? "Créer le projet →" : idea.type === "album" ? "Créer l\'album →" : "Créer un brouillon →"}
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-2.5 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
