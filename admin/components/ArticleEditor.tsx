"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Markdown from "@tiptap/extension-markdown";

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
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    publishedAt: initialData?.publishedAt ?? new Date().toISOString().split("T")[0],
    summary: initialData?.summary ?? "",
    image: initialData?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Commencez à écrire votre article..." }),
    ],
    content: initialData?.body ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-zinc prose-sm max-w-none focus:outline-none min-h-full px-8 py-6",
      },
    },
  });

  const set = useCallback(
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value })),
    []
  );

  function getBody(): string {
    if (!editor) return initialData?.body ?? "";
    return editor.storage.markdown?.getMarkdown?.() ?? editor.getText();
  }

  async function save(publish = false) {
    if (!slug) { alert("Le slug est requis"); return; }
    setSaving(true);

    const body = getBody();
    const isNew = !existingSlug;
    const url = isNew ? "/api/articles" : `/api/articles/${existingSlug}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew ? { slug, ...form, body } : { ...form, body };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) { alert("Erreur lors de la sauvegarde"); setSaving(false); return; }

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

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    if (form.image) {
      await fetch(`/api/upload?path=${encodeURIComponent(form.image)}`, { method: "DELETE" });
    }
    const url = await uploadFile(file);
    setForm((f) => ({ ...f, image: url }));
    setUploadingCover(false);
    e.target.value = "";
  }

  async function handleRemoveCover() {
    if (!form.image) return;
    await fetch(`/api/upload?path=${encodeURIComponent(form.image)}`, { method: "DELETE" });
    setForm((f) => ({ ...f, image: "" }));
  }

  async function handleBodyImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const url = await uploadFile(file);
    editor.chain().focus().setImage({ src: `/api/media${url}` }).run();
    e.target.value = "";
  }

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = prompt("URL du lien :");
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }
  }

  const inputClass =
    "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  const toolbarBtn = (active: boolean) =>
    `p-1.5 rounded text-sm font-medium transition-colors ${
      active
        ? "bg-amber-100 text-amber-700"
        : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
    }`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <button
          onClick={() => router.push("/articles")}
          className="text-zinc-400 hover:text-zinc-700 transition-colors text-sm"
        >
          ← Articles
        </button>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-500 text-sm truncate max-w-xs">{existingSlug ?? "Nouvel article"}</span>
        <div className="flex-1" />
        {existingSlug && (
          <button onClick={handleDelete} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            Supprimer
          </button>
        )}
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="px-4 py-1.5 text-sm border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          {saving ? "..." : "Sauvegarder"}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || buildStatus === "building"}
          className="px-4 py-1.5 text-sm bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {buildStatus === "building" ? "Build..." : "Publier"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                disabled={!!existingSlug}
                placeholder="mon-article"
                className={`${inputClass} ${existingSlug ? "opacity-40 cursor-not-allowed" : ""}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Titre</label>
              <input value={form.title} onChange={set("title")} placeholder="Titre de l'article" className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Date</label>
              <input type="date" value={form.publishedAt} onChange={set("publishedAt")} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Résumé</label>
              <textarea
                value={form.summary}
                onChange={set("summary")}
                placeholder="Une ligne résumant l'article"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Cover image */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Image de couverture</label>

              {form.image ? (
                <div className="space-y-2">
                  <img
                    src={`/api/media${form.image}`}
                    alt="Couverture"
                    className="w-full aspect-video object-cover rounded-lg border border-zinc-200"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      Remplacer
                    </button>
                    <button
                      onClick={handleRemoveCover}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full aspect-video border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-amber-300 hover:text-amber-500 transition-colors"
                >
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.023 11.095m-8.25 0h8.25" />
                  </svg>
                  <span className="text-xs">{uploadingCover ? "Upload..." : "Uploader une image"}</span>
                </button>
              )}

              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              <input ref={bodyImageInputRef} type="file" accept="image/*" onChange={handleBodyImageUpload} className="hidden" />
            </div>
          </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-4 py-2 border-b border-zinc-200 bg-zinc-50 flex-wrap shrink-0">
            <button onClick={() => editor?.chain().focus().toggleBold().run()} className={toolbarBtn(editor?.isActive("bold") ?? false)} title="Gras">
              <strong>B</strong>
            </button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={toolbarBtn(editor?.isActive("italic") ?? false)} title="Italique">
              <em>I</em>
            </button>
            <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={toolbarBtn(editor?.isActive("strike") ?? false)} title="Barré">
              <s>S</s>
            </button>

            <div className="w-px h-5 bg-zinc-200 mx-1" />

            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={toolbarBtn(editor?.isActive("heading", { level: 1 }) ?? false)} title="Titre 1">
              H1
            </button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor?.isActive("heading", { level: 2 }) ?? false)} title="Titre 2">
              H2
            </button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtn(editor?.isActive("heading", { level: 3 }) ?? false)} title="Titre 3">
              H3
            </button>

            <div className="w-px h-5 bg-zinc-200 mx-1" />

            <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor?.isActive("bulletList") ?? false)} title="Liste">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
            </button>
            <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor?.isActive("orderedList") ?? false)} title="Liste numérotée">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 0 1 1.326.656l.032.035c.21.312.181.72-.017 1.025l-1.38 1.907h2.035m0 0V15m0 0H2.99m3.5 2.625h-2.75" /></svg>
            </button>
            <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={toolbarBtn(editor?.isActive("blockquote") ?? false)} title="Citation">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            </button>
            <button onClick={() => editor?.chain().focus().toggleCode().run()} className={toolbarBtn(editor?.isActive("code") ?? false)} title="Code inline">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>
            </button>

            <div className="w-px h-5 bg-zinc-200 mx-1" />

            <button onClick={toggleLink} className={toolbarBtn(editor?.isActive("link") ?? false)} title="Lien">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
            </button>
            <button onClick={() => bodyImageInputRef.current?.click()} className={toolbarBtn(false)} title="Insérer une image">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
            </button>

            <div className="w-px h-5 bg-zinc-200 mx-1" />

            <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={toolbarBtn(false)} title="Séparateur">
              —
            </button>
          </div>

          {/* Tiptap editor */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} className="h-full" />
          </div>
        </div>
      </div>

      {/* Build logs */}
      {showLogs && (
        <div className="border-t border-zinc-200 bg-zinc-50 shrink-0">
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-xs font-medium text-zinc-500">
              Build{" "}
              {buildStatus === "building" && <span className="text-amber-500">en cours...</span>}
              {buildStatus === "success" && <span className="text-green-600">terminé</span>}
              {buildStatus === "error" && <span className="text-red-500">échoué</span>}
            </span>
            <button onClick={() => setShowLogs(false)} className="text-zinc-400 hover:text-zinc-700 text-xs">Fermer</button>
          </div>
          <pre className="px-5 pb-4 text-xs text-zinc-500 max-h-40 overflow-y-auto font-mono">
            {buildLogs.join("")}
          </pre>
        </div>
      )}
    </div>
  );
}
