"use client";

import type { Lang } from "@/lib/i18n";

// Barre FR/EN partagée par les éditeurs : bascule de locale + bouton de traduction.
// N'apparaît que pour un contenu déjà existant (la traduction part du FR canonique).
export default function EditorLangBar({
  hasItem,
  lang,
  enExists,
  translating,
  onSwitch,
  onTranslate,
}: {
  hasItem: boolean;
  lang: Lang;
  enExists: boolean;
  translating: boolean;
  onSwitch: (l: Lang) => void;
  onTranslate: () => void;
}) {
  if (!hasItem) return null;

  const tab = (l: Lang, label: string, disabled = false) => (
    <button
      type="button"
      onClick={() => onSwitch(l)}
      disabled={disabled || lang === l}
      title={disabled ? "Pas encore de traduction — clique « Traduire »" : undefined}
      className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
        lang === l
          ? "bg-amber-500 text-white"
          : "text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 p-0.5">
        {tab("fr", "FR")}
        {tab("en", "EN", !enExists)}
      </div>
      {lang === "fr" && (
        <button
          type="button"
          onClick={onTranslate}
          disabled={translating}
          className="px-2.5 py-1 text-xs text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors"
        >
          {translating ? "Traduction…" : enExists ? "✨ Retraduire EN" : "✨ Traduire en anglais"}
        </button>
      )}
    </div>
  );
}
