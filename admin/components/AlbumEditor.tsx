"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AlbumPhoto } from "@/lib/albums";
import { useLangEditing } from "@/lib/useLangEditing";
import AIAssist from "@/components/AIAssist";
import EditorLangBar from "@/components/EditorLangBar";

interface Props {
  slug?: string;
  initialData?: {
    title: string;
    date: string;
    location?: string;
    cover: string;
    summary?: string;
    photos: AlbumPhoto[];
    body: string;
  };
}

export default function AlbumEditor({ slug: existingSlug, initialData }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(existingSlug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!existingSlug);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyImageRef = useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    date: initialData?.date ?? new Date().toISOString().split("T")[0],
    location: initialData?.location ?? "",
    summary: initialData?.summary ?? "",
    body: initialData?.body ?? "",
  });
  const [cover, setCover] = useState(initialData?.cover ?? "");
  const [photos, setPhotos] = useState<AlbumPhoto[]>(initialData?.photos ?? []);

  function populate(d: NonNullable<Props["initialData"]>) {
    setForm({ title: d.title, date: d.date, location: d.location ?? "", summary: d.summary ?? "", body: d.body });
    setCover(d.cover ?? "");
    setPhotos(d.photos ?? []);
  }
  const serialize = () => JSON.stringify({ ...form, cover, photos });
  const serializeData = (d: NonNullable<Props["initialData"]>) =>
    JSON.stringify({ title: d.title, date: d.date, location: d.location ?? "", summary: d.summary ?? "", body: d.body, cover: d.cover ?? "", photos: d.photos ?? [] });

  const { lang, translating, transExists, setTransExists, status, setStatus, markClean, switchLang, translate } = useLangEditing({
    exists: !!existingSlug,
    getUrl: (l) => `/api/albums/${existingSlug}?lang=${l}`,
    translateUrl: (target) => `/api/albums/${existingSlug}/translate?lang=${target}`,
    serialize,
    serializeData,
    apply: populate,
  });

  function slugify(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadFile(file, `albums/${slug || "draft"}`);
    setCover(url);
    setUploadingCover(false);
    e.target.value = "";
  }

  async function handlePhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const folder = `albums/${slug || "draft"}`;
    const urls = await Promise.all(files.map((f) => uploadFile(f, folder)));
    const newPhotos = urls.map((src, i) => ({ src, alt: `Photo ${photos.length + i + 1}` }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploadingPhotos(false);
    e.target.value = "";
  }

  // Upload une image et insère le markdown ![](url) à la position du curseur dans le body.
  async function handleBodyImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    try {
      const url = await uploadFile(file, `albums/${slug || "draft"}`);
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

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    setPhotos(next);
  }

  async function save() {
    if (!slug) { setStatus("Le slug est requis"); return; }
    setSaving(true);
    setStatus(null);
    const isNew = !existingSlug;
    const url = isNew ? "/api/albums" : `/api/albums/${existingSlug}?lang=${lang}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew
      ? { slug, ...form, cover, photos }
      : { ...form, cover, photos };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setStatus("Erreur lors de la sauvegarde"); setSaving(false); return; }
    setSaving(false);
    if (isNew) { router.push(`/albums/${slug}`); return; }
    markClean();
    setStatus("saved");
    setTimeout(() => setStatus(null), 3000);
  }

  async function handleDelete() {
    if (!existingSlug || !confirm(`Supprimer "${existingSlug}"${lang === "fr" ? " et ses traductions" : ` (version ${lang.toUpperCase()})`} ?`)) return;
    await fetch(`/api/albums/${existingSlug}?lang=${lang}`, { method: "DELETE" });
    if (lang !== "fr") { setTransExists((prev) => ({ ...prev, [lang]: false })); await switchLang("fr"); }
    else router.push("/albums");
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button onClick={() => router.push("/albums")} className="text-zinc-400 hover:text-zinc-700 text-sm">← Albums</button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm truncate">{existingSlug ?? "Nouvel album"}</span>
        <EditorLangBar
          hasItem={!!existingSlug}
          lang={lang}
          transExists={transExists}
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
          {lang !== "fr" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              Traduction {lang.toUpperCase()} : relis, ajuste si besoin, puis <b>Sauvegarder</b>. Pour repartir du français, retraduis depuis l&apos;onglet FR.
            </div>
          )}
          {/* Title + Slug */}
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
                placeholder="Mon album"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Slug</label>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); setSlugManuallyEdited(true); }}
                disabled={!!existingSlug}
                placeholder="mon-album"
                className={`${inputClass} ${existingSlug ? "opacity-40 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {/* Date + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Lieu</label>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Paris, France" className={inputClass} />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Résumé</label>
            <textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} rows={2} placeholder="Description de l'album..." className={`${inputClass} resize-none`} />
            <AIAssist value={form.summary} onChange={(v) => setForm((f) => ({ ...f, summary: v }))} context="voyage" lang={lang} />
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
                {uploadingCover ? "Upload..." : "+ Uploader la couverture"}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Photos ({photos.length})</label>
              <button onClick={() => photosInputRef.current?.click()} disabled={uploadingPhotos} className="px-2.5 py-1 text-xs bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                {uploadingPhotos ? "Upload..." : "+ Ajouter des photos"}
              </button>
            </div>
            <input ref={photosInputRef} type="file" accept="image/*" multiple onChange={handlePhotosUpload} className="hidden" />
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img src={`/api/media${photo.src}`} alt={photo.alt} className="w-full h-20 object-cover rounded-lg border border-zinc-200" />
                    <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                      <input
                        type="text"
                        value={photo.alt}
                        onChange={(e) => setPhotos((prev) => prev.map((p, j) => j === i ? { ...p, alt: e.target.value } : p))}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Légende..."
                        className="w-full px-1.5 py-0.5 text-[10px] bg-white/90 text-zinc-900 rounded border-0 focus:outline-none mx-2"
                      />
                      <div className="flex gap-1">
                        <button onClick={() => movePhoto(i, i - 1)} disabled={i === 0} aria-label="Déplacer la photo à gauche" className="w-5 h-5 bg-white/80 text-zinc-700 rounded text-xs disabled:opacity-30">←</button>
                        <button onClick={() => movePhoto(i, i + 1)} disabled={i === photos.length - 1} aria-label="Déplacer la photo à droite" className="w-5 h-5 bg-white/80 text-zinc-700 rounded text-xs disabled:opacity-30">→</button>
                        <button onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))} aria-label="Retirer la photo" className="w-5 h-5 bg-red-500 text-white rounded text-xs">✕</button>
                      </div>
                    </div>
                    <span className="absolute top-1 left-1 text-[10px] text-white bg-black/50 rounded px-1">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Texte (Markdown, optionnel)</label>
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
              placeholder="Description du voyage, du contexte... (insère une image au curseur avec le bouton ci-dessus)"
              className={`${inputClass} resize-y text-sm leading-relaxed min-h-[35vh]`}
            />
            <input ref={bodyImageRef} type="file" accept="image/*" onChange={handleBodyImage} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
