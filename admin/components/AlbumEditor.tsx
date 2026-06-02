"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AlbumPhoto } from "@/lib/albums";
import AIAssist from "@/components/AIAssist";

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

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    date: initialData?.date ?? new Date().toISOString().split("T")[0],
    location: initialData?.location ?? "",
    summary: initialData?.summary ?? "",
    body: initialData?.body ?? "",
  });
  const [cover, setCover] = useState(initialData?.cover ?? "");
  const [photos, setPhotos] = useState<AlbumPhoto[]>(initialData?.photos ?? []);

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

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    [next[from], next[to]] = [next[to], next[from]];
    setPhotos(next);
  }

  async function save() {
    if (!slug) { alert("Le slug est requis"); return; }
    setSaving(true);
    const isNew = !existingSlug;
    const url = isNew ? "/api/albums" : `/api/albums/${existingSlug}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew
      ? { slug, ...form, cover, photos }
      : { ...form, cover, photos };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { alert("Erreur lors de la sauvegarde"); setSaving(false); return; }
    setSaving(false);
    if (isNew) router.push(`/albums/${slug}`);
  }

  async function handleDelete() {
    if (!existingSlug || !confirm(`Supprimer "${existingSlug}" ?`)) return;
    await fetch(`/api/albums/${existingSlug}`, { method: "DELETE" });
    router.push("/albums");
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button onClick={() => router.push("/albums")} className="text-zinc-400 hover:text-zinc-700 text-sm">← Albums</button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm truncate">{existingSlug ?? "Nouvel album"}</span>
        <div className="flex-1" />
        {existingSlug && (
          <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            Supprimer
          </button>
        )}
        <button onClick={save} disabled={saving} className="px-4 py-1.5 text-sm bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
          {saving ? "..." : "Sauvegarder"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Title + Slug */}
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
            <AIAssist value={form.summary} onChange={(v) => setForm((f) => ({ ...f, summary: v }))} context="voyage" />
          </div>

          {/* Cover */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Image de couverture</label>
            {cover ? (
              <div className="flex items-center gap-3">
                <img src={`/api/media${cover}`} alt="" className="w-24 h-16 object-cover rounded-lg border border-zinc-200" />
                <div className="flex gap-2">
                  <button onClick={() => coverInputRef.current?.click()} disabled={uploadingCover} className="px-2 py-1 text-xs border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors">Remplacer</button>
                  <button onClick={() => setCover("")} className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">✕</button>
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
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img src={`/api/media${photo.src}`} alt={photo.alt} className="w-full h-20 object-cover rounded-lg border border-zinc-200" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                      <input
                        type="text"
                        value={photo.alt}
                        onChange={(e) => setPhotos((prev) => prev.map((p, j) => j === i ? { ...p, alt: e.target.value } : p))}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Légende..."
                        className="w-full px-1.5 py-0.5 text-[10px] bg-white/90 text-zinc-900 rounded border-0 focus:outline-none mx-2"
                      />
                      <div className="flex gap-1">
                        <button onClick={() => movePhoto(i, i - 1)} disabled={i === 0} className="w-5 h-5 bg-white/80 text-zinc-700 rounded text-xs disabled:opacity-30">←</button>
                        <button onClick={() => movePhoto(i, i + 1)} disabled={i === photos.length - 1} className="w-5 h-5 bg-white/80 text-zinc-700 rounded text-xs disabled:opacity-30">→</button>
                        <button onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))} className="w-5 h-5 bg-red-500 text-white rounded text-xs">✕</button>
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
            <label className="text-xs font-medium text-zinc-400">Texte (Markdown, optionnel)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={6}
              placeholder="Description du voyage, du contexte..."
              className={`${inputClass} resize-y font-mono text-xs`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
