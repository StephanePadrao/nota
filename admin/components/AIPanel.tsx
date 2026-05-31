"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";

interface AIPanelProps {
  editor: Editor | null;
  title: string;
  summary: string;
  onTitleChange: (t: string) => void;
  onSummaryChange: (s: string) => void;
}

export default function AIPanel({ editor, title, summary, onTitleChange, onSummaryChange }: AIPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [researchTopic, setResearchTopic] = useState("");
  const [researchResult, setResearchResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  function getBodyText(): string {
    if (!editor) return "";
    return editor.getText();
  }

  async function callAI(action: string, body: Record<string, string>) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur IA");
      return data.result as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function suggestTitles() {
    const result = await callAI("titles", { text: getBodyText() });
    if (!result) return;
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) setTitles(parsed);
    } catch {
      setTitles([result]);
    }
  }

  async function generateSummary() {
    const result = await callAI("summarize", { text: getBodyText() });
    if (result) onSummaryChange(result.trim());
  }

  async function doResearch() {
    if (!researchTopic.trim()) return;
    const result = await callAI("research", { text: researchTopic, topic: researchTopic });
    if (result) setResearchResult(result);
  }

  function insertResearch() {
    if (!editor || !researchResult) return;
    editor.chain().focus().insertContent("<hr />" + researchResult.split("\n").map((l) => `<p>${l}</p>`).join("")).run();
    setResearchResult("");
    setResearchTopic("");
  }

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <span className="text-sm font-semibold text-zinc-700">Assistant IA</span>
          <span className="text-xs text-zinc-400">Groq</span>
        </div>
        <svg
          className={`size-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 py-4 space-y-4 border-t border-zinc-100">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Titres */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Titres SEO</span>
              <button
                onClick={suggestTitles}
                disabled={loading === "titles"}
                className="px-2.5 py-1 text-xs bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {loading === "titles" ? "..." : "Suggérer 3 titres"}
              </button>
            </div>
            {titles.length > 0 && (
              <div className="space-y-1.5">
                {titles.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { onTitleChange(t); setTitles([]); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-700 bg-zinc-50 hover:bg-amber-50 hover:text-amber-800 rounded-lg border border-zinc-200 hover:border-amber-300 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Meta description</span>
            <button
              onClick={generateSummary}
              disabled={loading === "summarize"}
              className="px-2.5 py-1 text-xs bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {loading === "summarize" ? "..." : "Générer résumé"}
            </button>
          </div>

          {/* Recherche web */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-2">Recherche web</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doResearch()}
                placeholder="Sujet à rechercher..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                onClick={doResearch}
                disabled={!researchTopic.trim() || loading === "research"}
                className="px-2.5 py-1.5 text-xs bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {loading === "research" ? "..." : "Chercher"}
              </button>
            </div>
            {researchResult && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed mb-2">{researchResult}</p>
                <button
                  onClick={insertResearch}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Insérer dans l'article →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
