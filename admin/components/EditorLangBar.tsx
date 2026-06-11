"use client";

import { TRANSLATABLE, type Lang } from "@/lib/i18n";

const LABEL: Record<Lang, string> = { fr: "FR", en: "EN", es: "ES", pt: "PT" };

// Barre multilingue partagée par les éditeurs : onglets FR/EN/ES/PT + boutons de
// traduction par langue. N'apparaît que pour un contenu déjà existant (la traduction
// part du FR canonique).
export default function EditorLangBar({
  hasItem,
  lang,
  transExists,
  translating,
  onSwitch,
  onTranslate,
}: {
  hasItem: boolean;
  lang: Lang;
  transExists: Record<Lang, boolean>;
  translating: Lang | null;
  onSwitch: (l: Lang) => void;
  onTranslate: (l: Lang) => void;
}) {
  if (!hasItem) return null;

  const allLangs: Lang[] = ["fr", ...TRANSLATABLE];

  const tab = (l: Lang) => {
    const disabled = l !== "fr" && !transExists[l];
    return (
      <button
        key={l}
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
        {LABEL[l]}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 p-0.5">
        {allLangs.map(tab)}
      </div>
      {lang === "fr" && (
        <div className="flex items-center gap-1">
          {TRANSLATABLE.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onTranslate(l)}
              disabled={translating !== null}
              title={transExists[l] ? `Retraduire en ${LABEL[l]}` : `Traduire en ${LABEL[l]}`}
              className="px-2 py-1 text-xs text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              {translating === l ? "…" : `${transExists[l] ? "↻" : "✨"} ${LABEL[l]}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
