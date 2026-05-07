"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ArticleData {
  title: string;
  publishedAt: string;
  summary: string;
  image: string;
  body: string;
}

interface Props {
  slug?: string;
  initialData?: Partial<ArticleData>;
}

export default function ArticleEditor({ slug: existingSlug, initialData }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(existingSlug ?? "");
  const [form, setForm] = useState<ArticleData>({
    title: "",
    publishedAt: new Date().toISOString().split("T")[0],
    summary: "",
    image: "",
    body: "",
    ...initialData,
  });
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = useCallback(
    (field: keyof ArticleData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value })),
    []
  );

  async function save(publish = false) {
    if (!slug) {
      alert("Le slug est requis");
      return;
    }
    setSaving(true);

    const isNew = !existingSlug;
    const url = isNew ? "/api/articles" : `/api/articles/${existingSlug}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew ? { slug, ...form } : form;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Erreur lors de la sauvegarde");
      setSaving(false);
      return;
    }

    if (publish) {
      setBuildStatus("building");
      setBuildLogs([]);
      setShowLogs(true);
      await fetch("/api/build", { method: "POST" });

      const poll = setInterval(async () => {
        const r = await fetch("/api/build");
        const data = await r.json();
        setBuildStatus(data.status);
        setBuildLogs(data.logs ?? []);
        if (data.status !== "building") clearInterval(poll);
      }, 800);
    }

    setSaving(false);
    if (isNew) router.push(`/articles/${slug}`);
  }

  async function handleDelete() {
    if (!existingSlug) return;
    if (!confirm(`Supprimer l'article "${existingSlug}" ?`)) return;
    await fetch(`/api/articles/${existingSlug}`, { method: "DELETE" });
    router.push("/articles");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setForm((f) => ({ ...f, image: data.url }));
    setUploadingImage(false);
  }

  const inputClass =
    "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-amber-500 transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-zinc-800">
        <button
          onClick={() => router.push("/articles")}
          className="text-zinc-400 hover:text-white transition-colors text-sm"
        >
          ← Articles
        </button>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300 text-sm">{existingSlug ?? "Nouvel article"}</span>
        <div className="flex-1" />
        {existingSlug && (
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            Supprimer
          </button>
        )}
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="px-4 py-1.5 text-sm bg-zinc-800 border border-zinc-700 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "..." : "Sauvegarder"}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || buildStatus === "building"}
          className="px-4 py-1.5 text-sm bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {buildStatus === "building" ? "Build en cours..." : "Publier"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Frontmatter sidebar */}
        <aside className="w-64 shrink-0 border-r border-zinc-800 p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              disabled={!!existingSlug}
              placeholder="mon-article"
              className={`${inputClass} ${existingSlug ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Titre</label>
            <input value={form.title} onChange={set("title")} placeholder="Titre de l'article" className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Date de publication</label>
            <input type="date" value={form.publishedAt} onChange={set("publishedAt")} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Résumé</label>
            <textarea
              value={form.summary}
              onChange={set("summary")}
              placeholder="Résumé en une ligne"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Image de couverture</label>
            <input value={form.image} onChange={set("image")} placeholder="/blog/image.jpg" className={inputClass} />
            <label className="block">
              <span className="text-xs text-zinc-500 cursor-pointer hover:text-amber-500 transition-colors">
                {uploadingImage ? "Upload..." : "Ou uploader un fichier →"}
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image && (
              <img src={form.image} alt="" className="w-full aspect-video object-cover rounded-lg mt-2 opacity-80" />
            )}
          </div>
        </aside>

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1 px-5 py-2 border-b border-zinc-800">
            <button
              onClick={() => setTab("write")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                tab === "write" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Écrire
            </button>
            <button
              onClick={() => setTab("preview")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                tab === "preview" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Aperçu
            </button>
          </div>

          {tab === "write" ? (
            <textarea
              value={form.body}
              onChange={set("body")}
              placeholder="Écrivez votre article en Markdown..."
              className="flex-1 w-full p-6 bg-transparent text-zinc-200 text-sm font-mono leading-relaxed focus:outline-none resize-none placeholder:text-zinc-600"
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none">
              <PreviewContent content={form.body} />
            </div>
          )}
        </div>
      </div>

      {/* Build logs */}
      {showLogs && (
        <div className="border-t border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-xs font-medium text-zinc-400">
              Build{" "}
              {buildStatus === "building" && <span className="text-amber-400">en cours...</span>}
              {buildStatus === "success" && <span className="text-green-400">terminé</span>}
              {buildStatus === "error" && <span className="text-red-400">échoué</span>}
            </span>
            <button onClick={() => setShowLogs(false)} className="text-zinc-500 hover:text-white text-xs">
              Fermer
            </button>
          </div>
          <pre className="px-5 pb-4 text-xs text-zinc-400 max-h-40 overflow-y-auto font-mono">
            {buildLogs.join("")}
          </pre>
        </div>
      )}
    </div>
  );
}

function PreviewContent({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-zinc-600 italic">Aucun contenu à afficher.</p>;
  }
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content
          .replace(/^### (.+)$/gm, "<h3>$1</h3>")
          .replace(/^## (.+)$/gm, "<h2>$1</h2>")
          .replace(/^# (.+)$/gm, "<h1>$1</h1>")
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/`(.+?)`/g, "<code>$1</code>")
          .replace(/\n\n/g, "</p><p>")
          .replace(/^(?!<[h|p|u|o])/gm, "<p>")
          .concat("</p>"),
      }}
    />
  );
}
