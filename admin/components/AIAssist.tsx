"use client";

import { useState } from "react";

type AIContext = "project" | "voyage";

const ACTIONS = [
  { id: "correct", label: "Corriger" },
  { id: "rewrite", label: "Reformuler" },
  { id: "shorten", label: "Raccourcir" },
] as const;

export default function AIAssist({
  value,
  onChange,
  context,
}: {
  value: string;
  onChange: (v: string) => void;
  context: AIContext;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string) {
    if (!value.trim()) {
      setError("Écris d'abord un peu de texte.");
      return;
    }
    setLoading(action);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur IA");
      setResult((data.result as string).trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-zinc-400">✨ IA</span>
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => run(a.id)}
            disabled={loading !== null}
            className="px-2 py-0.5 text-[11px] text-zinc-600 bg-zinc-100 rounded-md hover:bg-amber-100 hover:text-amber-700 disabled:opacity-50 transition-colors"
          >
            {loading === a.id ? "…" : a.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}

      {result && (
        <div className="mt-1.5 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed">{result}</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                onChange(result);
                setResult(null);
              }}
              className="px-2 py-0.5 text-[11px] bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Utiliser
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-2 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
