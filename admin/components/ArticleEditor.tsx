"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { marked } from "marked";
import TurndownService from "turndown";

interface ArticleData {
  title: string;
  publishedAt: string;
  summary: string;
  image: string;
  body: string;
  draft?: boolean;
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
  const [isDraft, setIsDraft] = useState(initialData?.draft ?? true);
  const [metaOpen, setMetaOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "error">("idle");
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

  const initialHtml = initialData?.body
    ? (marked(initialData.body) as string).replace(
        /(<img[^>]+src=")\/blog\//g,
        '$1/api/media/blog/'
      )
    : "";

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Commencez à écrire votre article..." }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: false }),
    ],
    content: initialHtml,
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
    const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
    // Strip the admin proxy prefix so saved URLs work on the public blog
    const html = editor.getHTML().replace(/src="\/api\/media\//g, 'src="/');
    return td.turndown(html);
  }

  async function save(publish = false, forceDraft = false) {
    if (!slug) { alert("Le slug est requis"); return; }
    setSaving(true);

    const body = getBody();
    const isNew = !existingSlug;
    const url = isNew ? "/api/articles" : `/api/articles/${existingSlug}`;
    const method = isNew ? "POST" : "PUT";
    const draftValue = forceDraft ? true : publish ? false : isDraft;
    const payload = isNew ? { slug, ...form, body, draft: draftValue } : { ...form, body, draft: draftValue };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) { alert("Erreur lors de la sauvegarde"); setSaving(false); return; }

    if (publish) {
      setIsDraft(false);
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

    if (forceDraft) setIsDraft(true);
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

  const ia = (name: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(name, attrs) ?? false;

  const inputClass =
    "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

  const tbtn = (active: boolean) =>
    `p-1.5 rounded text-sm font-medium transition-colors ${
      active
        ? "bg-amber-100 text-amber-700"
        : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
    }`;

  const Sep = () => <div className="w-px h-5 bg-zinc-200 mx-1 shrink-0" />;

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
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

        {/* Status badge */}
        {isDraft ? (
          <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-600 rounded-full">Brouillon</span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 rounded-full">Publié</span>
        )}

        {existingSlug && (
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
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
        {!isDraft && (
          <button
            onClick={() => save(false, true)}
            disabled={saving}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg disabled:opacity-50 transition-colors"
            title="Repasser en brouillon"
          >
            ↩ Brouillon
          </button>
        )}
        <button
          onClick={() => save(true)}
          disabled={saving || buildStatus === "building"}
          className="px-4 py-1.5 text-sm bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {buildStatus === "building" ? "Build..." : isDraft ? "Publier" : "Republier"}
        </button>
      </div>

      {/* Collapsible metadata panel */}
      <div className="border-b border-zinc-200 bg-zinc-50/60 shrink-0">
        <button
          onClick={() => setMetaOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide hover:text-zinc-600 transition-colors select-none"
        >
          <span>Métadonnées</span>
          <svg
            className={`size-3.5 transition-transform duration-200 ${metaOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {metaOpen && (
          <div className="px-6 pb-5 space-y-4">
            {/* Row 1: Titre + Slug + Date */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Titre</label>
                <input
                  value={form.title}
                  onChange={set("title")}
                  placeholder="Titre de l'article"
                  className={inputClass}
                />
              </div>
              <div className="w-52 space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  disabled={!!existingSlug}
                  placeholder="mon-article"
                  className={`${inputClass} ${existingSlug ? "opacity-40 cursor-not-allowed" : ""}`}
                />
              </div>
              <div className="w-40 space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Date</label>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={set("publishedAt")}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: Résumé + Image de couverture */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Résumé</label>
                <textarea
                  value={form.summary}
                  onChange={set("summary")}
                  placeholder="Une ligne résumant l'article"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="w-56 space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Image de couverture</label>
                {form.image ? (
                  <div className="space-y-2">
                    <img
                      src={`/api/media${form.image}`}
                      alt="Couverture"
                      className="w-full h-16 object-cover rounded-lg border border-zinc-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="flex-1 px-2 py-1 text-xs border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                      >
                        Remplacer
                      </button>
                      <button
                        onClick={handleRemoveCover}
                        className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Supprimer l'image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="w-full h-[4.5rem] border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:border-amber-300 hover:text-amber-500 disabled:opacity-50 transition-colors text-xs"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 1.023 11.095m-8.25 0h8.25" />
                    </svg>
                    {uploadingCover ? "Upload..." : "Uploader une image"}
                  </button>
                )}
              </div>
            </div>

            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <input ref={bodyImageInputRef} type="file" accept="image/*" onChange={handleBodyImageUpload} className="hidden" />
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-zinc-200 bg-zinc-50 flex-wrap shrink-0">

          {/* Normal paragraph */}
          <button
            onClick={() => editor?.chain().focus().setParagraph().run()}
            className={tbtn(ia("paragraph") && !ia("heading"))}
            title="Paragraphe normal"
          >
            ¶
          </button>

          <Sep />

          {/* Headings */}
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={tbtn(ia("heading", { level: 1 }))} title="Titre 1">H1</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={tbtn(ia("heading", { level: 2 }))} title="Titre 2">H2</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={tbtn(ia("heading", { level: 3 }))} title="Titre 3">H3</button>

          <Sep />

          {/* Text formatting */}
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={tbtn(ia("bold"))} title="Gras (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={tbtn(ia("italic"))} title="Italique (Ctrl+I)">
            <em>I</em>
          </button>
          <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={tbtn(ia("underline"))} title="Souligné (Ctrl+U)">
            <span style={{ textDecoration: "underline" }}>U</span>
          </button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={tbtn(ia("strike"))} title="Barré">
            <s>S</s>
          </button>
          <button onClick={() => editor?.chain().focus().toggleHighlight().run()} className={tbtn(ia("highlight"))} title="Surligner">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
          </button>

          <Sep />

          {/* Text align */}
          <button onClick={() => editor?.chain().focus().setTextAlign("left").run()} className={tbtn(ia("paragraph", { textAlign: "left" }) || ia("heading", { textAlign: "left" }))} title="Aligner à gauche">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().setTextAlign("center").run()} className={tbtn(ia("paragraph", { textAlign: "center" }) || ia("heading", { textAlign: "center" }))} title="Centrer">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M7.5 12h9m-6 5.25h9" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().setTextAlign("right").run()} className={tbtn(ia("paragraph", { textAlign: "right" }) || ia("heading", { textAlign: "right" }))} title="Aligner à droite">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M10.5 12h10.5M3.75 17.25h16.5" />
            </svg>
          </button>

          <Sep />

          {/* Lists & blocks */}
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={tbtn(ia("bulletList"))} title="Liste à puces">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={tbtn(ia("orderedList"))} title="Liste numérotée">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 0 1 1.326.656l.032.035c.21.312.181.72-.017 1.025l-1.38 1.907h2.035m0 0V15m0 0H2.99m3.5 2.625h-2.75" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={tbtn(ia("blockquote"))} title="Citation">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </button>

          <Sep />

          {/* Code */}
          <button onClick={() => editor?.chain().focus().toggleCode().run()} className={tbtn(ia("code"))} title="Code inline">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={tbtn(ia("codeBlock"))} title="Bloc de code">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
          </button>

          <Sep />

          {/* Link, Image, HR */}
          <button onClick={toggleLink} className={tbtn(ia("link"))} title="Lien">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </button>
          <button onClick={() => bodyImageInputRef.current?.click()} className={tbtn(false)} title="Insérer une image">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={tbtn(false)} title="Séparateur horizontal">
            —
          </button>

          <Sep />

          {/* Clear formatting */}
          <button
            onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
            className={tbtn(false)}
            title="Effacer la mise en forme"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Undo / Redo */}
          <button onClick={() => editor?.chain().focus().undo().run()} className={tbtn(false)} title="Annuler (Ctrl+Z)">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
          <button onClick={() => editor?.chain().focus().redo().run()} className={tbtn(false)} title="Rétablir (Ctrl+Y)">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </div>

        {/* Tiptap editor content */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      {/* Build logs */}
      {showLogs && (
        <div className="border-t border-zinc-200 bg-zinc-50 shrink-0">
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-xs font-medium text-zinc-500">
              Build{" "}
              {buildStatus === "building" && <span className="text-amber-500">en cours...</span>}
              {buildStatus === "success" && <span className="text-green-600">terminé ✓</span>}
              {buildStatus === "error" && <span className="text-red-500">échoué ✗</span>}
            </span>
            <button onClick={() => setShowLogs(false)} className="text-zinc-400 hover:text-zinc-700 text-xs">
              Fermer
            </button>
          </div>
          <pre className="px-5 pb-4 text-xs text-zinc-500 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
            {buildLogs.join("")}
          </pre>
        </div>
      )}
    </div>
  );
}
