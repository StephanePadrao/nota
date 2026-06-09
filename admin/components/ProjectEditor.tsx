"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProjectLink } from "@/lib/projects";
import { useLangEditing } from "@/lib/useLangEditing";
import AIAssist from "@/components/AIAssist";
import EditorLangBar from "@/components/EditorLangBar";

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
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyImageRef = useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = useState(false);

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

  function populate(d: NonNullable<Props["initialData"]>) {
    setForm({ title: d.title, dates: d.dates, active: d.active, description: d.description, body: d.body });
    setTechnologies(d.technologies ?? []);
    setLinks(d.links ?? []);
    setCover(d.cover ?? "");
    setImages(d.images ?? []);
  }
  const serialize = () => JSON.stringify({ ...form, technologies, links, cover, images });
  const serializeData = (d: NonNullable<Props["initialData"]>) =>
    JSON.stringify({ title: d.title, dates: d.dates, active: d.active, description: d.description, body: d.body, technologies: d.technologies ?? [], links: d.links ?? [], cover: d.cover ?? "", images: d.images ?? [] });

  const { lang, translating, enExists, setEnExists, status, setStatus, markClean, switchLang, translate } = useLangEditing({
    exists: !!existingSlug,
    getUrl: (l) => `/api/projects/${existingSlug}?lang=${l}`,
    translateUrl: () => `/api/projects/${existingSlug}/translate`,
    serialize,
    serializeData,
    apply: populate,
  });

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

  // Upload une image et insère le markdown ![](url) à la position du curseur dans le body.
  async function handleBodyImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    try {
      const url = await uploadFile(file, `projects`);
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
    const url = isNew ? "/api/projects" : `/api/projects/${existingSlug}?lang=${lang}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew
      ? { slug, ...form, technologies, links, cover, images }
      : { ...form, technologies, links, cover, images };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setStatus("Erreur lors de la sauvegarde"); setSaving(false); return; }
    setSaving(false);
    if (isNew) { router.push(`/projects/${slug}`); return; }
    markClean();
    setStatus("saved");
    setTimeout(() => setStatus(null), 3000);
  }

  async function handleDelete() {
    if (!existingSlug || !confirm(`Supprimer "${existingSlug}"${lang === "en" ? " (version EN)" : " et sa traduction EN"} ?`)) return;
    await fetch(`/api/projects/${existingSlug}?lang=${lang}`, { method: "DELETE" });
    if (lang === "en") { setEnExists(false); await switchLang("fr"); }
    else router.push("/projects");
  }

  const inputClass = "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button onClick={() => router.push("/projects")} className="text-zinc-400 hover:text-zinc-700 text-sm">← Projets</button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm truncate">{existingSlug ?? "Nouveau projet"}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
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
            <AIAssist value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} context="project" lang={lang} />
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
              <button onClick={addTech} aria-label="Ajouter la technologie" className="px-3 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">+</button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {technologies.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-xs">
                    {t}
                    <button onClick={() => setTechnologies((prev) => prev.filter((x) => x !== t))} aria-label="Retirer la technologie" className="text-zinc-400 hover:text-red-500 transition-colors">×</button>
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
              <div key={i} className="flex flex-col sm:flex-row gap-2">
                <input
                  value={link.type}
                  onChange={(e) => setLinks((prev) => prev.map((l, j) => j === i ? { ...l, type: e.target.value } : l))}
                  placeholder="Type (Site, GitHub...)"
                  className={`${inputClass} sm:w-36`}
                />
                <input
                  value={link.href}
                  onChange={(e) => setLinks((prev) => prev.map((l, j) => j === i ? { ...l, href: e.target.value } : l))}
                  placeholder="https://..."
                  className={`${inputClass} flex-1`}
                />
                <button onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))} aria-label="Retirer le lien" className="px-2 text-zinc-400 hover:text-red-500 transition-colors text-sm">✕</button>
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

          {/* Gallery */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Galerie d&apos;images</label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {images.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={`/api/media${src}`} alt="" className="w-full h-16 object-cover rounded-lg border border-zinc-200" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Retirer l'image"
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Description longue (Markdown)</label>
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
              placeholder="Description détaillée du projet... (insère une image au curseur avec le bouton ci-dessus)"
              className={`${inputClass} resize-y text-sm leading-relaxed min-h-[40vh]`}
            />
            <input ref={bodyImageRef} type="file" accept="image/*" onChange={handleBodyImage} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
