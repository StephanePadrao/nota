"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLangEditing } from "@/lib/useLangEditing";
import AIAssist from "@/components/AIAssist";
import EditorLangBar from "@/components/EditorLangBar";

interface Props {
  slug?: string;
  initialData?: {
    title: string;
    date: string;
    description: string;
    cover?: string;
    tags: string[];
    draft: boolean;
    body: string;
  };
}

export default function BlogEditor({ slug: existingSlug, initialData }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(existingSlug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!existingSlug);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyImageRef = useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    date: initialData?.date ?? "",
    description: initialData?.description ?? "",
    draft: initialData?.draft ?? false,
    body: initialData?.body ?? "",
  });
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [cover, setCover] = useState(initialData?.cover ?? "");

  function populate(d: NonNullable<Props["initialData"]>) {
    setForm({ title: d.title, date: d.date, description: d.description, draft: d.draft, body: d.body });
    setTags(d.tags ?? []);
    setCover(d.cover ?? "");
  }
  const serialize = () => JSON.stringify({ ...form, tags, cover });
  const serializeData = (d: NonNullable<Props["initialData"]>) =>
    JSON.stringify({ title: d.title, date: d.date, description: d.description, draft: d.draft, body: d.body, tags: d.tags ?? [], cover: d.cover ?? "" });

  const { lang, translating, enExists, setEnExists, status, setStatus, markClean, switchLang, translate } = useLangEditing({
    exists: !!existingSlug,
    getUrl: (l) => `/api/blog/${existingSlug}?lang=${l}`,
    translateUrl: () => `/api/blog/${existingSlug}/translate`,
    serialize,
    serializeData,
    apply: populate,
  });

  function slugify(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string;
  }

  function uploadFolder(): string {
    return `blog/${slug || "draft"}`;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadFile(file, uploadFolder());
    setCover(url);
    setUploadingCover(false);
    e.target.value = "";
  }

  // Upload une image et insère le markdown ![](url) à la position du curseur dans le body.
  async function handleBodyImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    try {
      const url = await uploadFile(file, uploadFolder());
      const ta = bodyRef.current;
      const start = ta?.selectionStart ?? form.body.length;
      const end = ta?.selectionEnd ?? form.body.length;
      const snippet = `\n![](${url})\n`;
      setForm((f) => ({ ...f, body: f.body.slice(0, start) + snippet + f.body.slice(end) }));
    } finally {
      setInsertingImage(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (!slug) { setStatus("Le slug est requis"); return; }
    setSaving(true);
    setStatus(null);
    const isNew = !existingSlug;
    const url = isNew ? "/api/blog" : `/api/blog/${existingSlug}?lang=${lang}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew ? { slug, ...form, tags, cover } : { ...form, tags, cover };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setStatus("Erreur lors de la sauvegarde"); setSaving(false); return; }
    setSaving(false);
    if (isNew) { router.push(`/blog/${slug}`); return; }
    markClean();
    setStatus("saved");
    setTimeout(() => setStatus(null), 3000);
  }

  async function handleDelete() {
    if (!existingSlug || !confirm(`Supprimer "${existingSlug}"${lang === "en" ? " (version EN)" : " et sa traduction EN"} ?`)) return;
    await fetch(`/api/blog/${existingSlug}?lang=${lang}`, { method: "DELETE" });
    if (lang === "en") { setEnExists(false); await switchLang("fr"); }
    else router.push("/blog");
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button onClick={() => router.push("/blog")} className="text-zinc-400 hover:text-zinc-700 text-sm">← Blog</button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm truncate">{existingSlug ?? "Nouvel article"}</span>
        <EditorLangBar
          hasItem={!!existingSlug}
          lang={lang}
          enExists={enExists}
          translating={translating}
          onSwitch={switchLang}
          onTranslate={translate}
        />
        <div className="flex-1" />
        {status === "saved" && <span className="text-xs text-green-600 shrink-0">Enregistré ✓</span>}
        {status && status !== "saved" && <span className="text-xs text-red-500 shrink-0">{status}</span>}
        {existingSlug && (
          <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
            Supprimer
          </button>
        )}
        <button onClick={save} disabled={saving} className="px-4 py-1.5 text-sm bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors shrink-0">
          {saving ? "Enregistrement…" : "Sauvegarder"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {lang === "en" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              Traduction anglaise — relis, ajuste si besoin, puis <b>Sauvegarder</b>. Pour repartir du français, utilise « Retraduire EN » depuis l&apos;onglet FR.
            </div>
          )}
          {/* Slug + Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Titre</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, title: v }));
                  if (!slugManuallyEdited) setSlug(slugify(v));
                }}
                placeholder="Titre de l'article"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Slug</label>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); setSlugManuallyEdited(true); }}
                disabled={!!existingSlug}
                placeholder="mon-article"
                className={`${inputClass} ${existingSlug ? "opacity-40 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {/* Date + Draft */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input type="checkbox" checked={form.draft} onChange={(e) => setForm((f) => ({ ...f, draft: e.target.checked }))} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm text-zinc-700">Brouillon <span className="text-zinc-400">(caché du site)</span></span>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Description courte</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Une ou deux lignes résumant l'article" className={`${inputClass} resize-none`} />
            <AIAssist value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} context="project" lang={lang} />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Agilité, Scrum..."
                className={`${inputClass} flex-1`}
              />
              <button onClick={addTag} aria-label="Ajouter le tag" className="px-3 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">+</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-xs">
                    {t}
                    <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} aria-label="Retirer le tag" className="text-zinc-400 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Image de couverture</label>
            {cover ? (
              <div className="flex items-center gap-3">
                <img src={`/api/media${cover}`} alt="" className="w-24 h-16 object-cover rounded-lg border border-zinc-200" />
                <div className="flex gap-2">
                  <button onClick={() => coverInputRef.current?.click()} disabled={uploadingCover} className="px-2 py-1 text-xs border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors">Remplacer</button>
                  <button onClick={() => setCover("")} aria-label="Retirer la couverture" className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">✕</button>
                </div>
              </div>
            ) : (
              <button onClick={() => coverInputRef.current?.click()} disabled={uploadingCover} className="w-full h-16 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 hover:border-amber-300 hover:text-amber-500 disabled:opacity-50 transition-colors text-xs">
                {uploadingCover ? "Upload..." : "+ Uploader une couverture"}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Contenu de l&apos;article (Markdown)</label>
              <button
                type="button"
                onClick={() => bodyImageRef.current?.click()}
                disabled={insertingImage}
                className="px-2 py-0.5 text-[11px] text-zinc-600 bg-zinc-100 rounded-md hover:bg-amber-100 hover:text-amber-700 disabled:opacity-50 transition-colors"
              >
                {insertingImage ? "Upload…" : "🖼 Insérer une image"}
              </button>
            </div>
            <textarea
              ref={bodyRef}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="## un titre de section&#10;&#10;Le contenu de l'article en Markdown. Insère une image au curseur avec le bouton ci-dessus."
              className={`${inputClass} resize-y text-sm leading-relaxed min-h-[40vh]`}
            />
            <input ref={bodyImageRef} type="file" accept="image/*" onChange={handleBodyImage} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
