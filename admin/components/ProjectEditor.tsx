"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProjectLink } from "@/lib/projects";
import AIAssist from "@/components/AIAssist";

interface Props {
  slug?: string;
  initialData?: {
    title: string;
    dates: string;
    active: boolean;
    description: string;
    technologies: string[];
    links?: ProjectLink[];
    cover?: string;
    images?: string[];
    body: string;
  };
}

export default function ProjectEditor({ slug: existingSlug, initialData }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(existingSlug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!existingSlug);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    dates: initialData?.dates ?? "",
    active: initialData?.active ?? true,
    description: initialData?.description ?? "",
    body: initialData?.body ?? "",
  });
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies ?? []);
  const [techInput, setTechInput] = useState("");
  const [links, setLinks] = useState<ProjectLink[]>(initialData?.links ?? []);
  const [cover, setCover] = useState(initialData?.cover ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);

  function slugify(s: string): string {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function addTech() {
    const t = techInput.trim();
    if (t && !technologies.includes(t)) setTechnologies((prev) => [...prev, t]);
    setTechInput("");
  }

  function addLink() {
    setLinks((prev) => [...prev, { type: "Site", href: "" }]);
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
    const url = await uploadFile(file, `projects`);
    setCover(url);
    setUploadingCover(false);
    e.target.value = "";
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    const urls = await Promise.all(files.map((f) => uploadFile(f, `projects`)));
    setImages((prev) => [...prev, ...urls]);
    setUploadingGallery(false);
    e.target.value = "";
  }

  async function save() {
    if (!slug) { alert("Le slug est requis"); return; }
    setSaving(true);
    const isNew = !existingSlug;
    const url = isNew ? "/api/projects" : `/api/projects/${existingSlug}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew
      ? { slug, ...form, technologies, links, cover, images }
      : { ...form, technologies, links, cover, images };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { alert("Erreur lors de la sauvegarde"); setSaving(false); return; }
    setSaving(false);
    if (isNew) router.push(`/projects/${slug}`);
  }

  async function handleDelete() {
    if (!existingSlug || !confirm(`Supprimer "${existingSlug}" ?`)) return;
    await fetch(`/api/projects/${existingSlug}`, { method: "DELETE" });
    router.push("/projects");
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button onClick={() => router.push("/projects")} className="text-zinc-400 hover:text-zinc-700 text-sm">← Projets</button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm truncate">{existingSlug ?? "Nouveau projet"}</span>
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
          {/* Slug + Title */}
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
                placeholder="Mon projet"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Slug</label>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); setSlugManuallyEdited(true); }}
                disabled={!!existingSlug}
                placeholder="mon-projet"
                className={`${inputClass} ${existingSlug ? "opacity-40 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>

          {/* Dates + Active */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Dates</label>
              <input value={form.dates} onChange={(e) => setForm((f) => ({ ...f, dates: e.target.value }))} placeholder="2024 - Aujourd'hui" className={inputClass} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm text-zinc-700">Projet actif</span>
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Description courte</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Une ligne résumant le projet" className={`${inputClass} resize-none`} />
            <AIAssist value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} context="project" />
          </div>

          {/* Technologies */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Technologies</label>
            <div className="flex gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                placeholder="React, TypeScript..."
                className={`${inputClass} flex-1`}
              />
              <button onClick={addTech} className="px-3 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">+</button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {technologies.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-xs">
                    {t}
                    <button onClick={() => setTechnologies((prev) => prev.filter((x) => x !== t))} className="text-zinc-400 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Liens</label>
              <button onClick={addLink} className="text-xs text-amber-500 hover:text-amber-600">+ Ajouter</button>
            </div>
            {links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={link.type}
                  onChange={(e) => setLinks((prev) => prev.map((l, j) => j === i ? { ...l, type: e.target.value } : l))}
                  placeholder="Type (Site, GitHub...)"
                  className={`${inputClass} w-36`}
                />
                <input
                  value={link.href}
                  onChange={(e) => setLinks((prev) => prev.map((l, j) => j === i ? { ...l, href: e.target.value } : l))}
                  placeholder="https://..."
                  className={`${inputClass} flex-1`}
                />
                <button onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))} className="px-2 text-zinc-400 hover:text-red-500 transition-colors text-sm">✕</button>
              </div>
            ))}
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
                {uploadingCover ? "Upload..." : "+ Uploader une couverture"}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Gallery */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Galerie d'images</label>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {images.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={`/api/media${src}`} alt="" className="w-full h-16 object-cover rounded-lg border border-zinc-200" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery} className="w-full h-10 border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 hover:border-amber-300 hover:text-amber-500 disabled:opacity-50 transition-colors text-xs">
              {uploadingGallery ? "Upload..." : "+ Ajouter des images à la galerie"}
            </button>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Description longue (Markdown)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={10}
              placeholder="Description détaillée du projet..."
              className={`${inputClass} resize-y font-mono text-xs`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
