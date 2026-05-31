"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { NodeSelection } from "prosemirror-state";
import type { Editor } from "@tiptap/react";

interface ImageToolbarProps {
  editor: Editor | null;
}

type Align = "left" | "center" | "right" | "full";

export default function ImageToolbar({ editor }: ImageToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [align, setAlignState] = useState<Align>("full");
  const [caption, setCaption] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const update = useCallback(() => {
    if (!editor) return;
    const { selection } = editor.state;
    if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") {
      setVisible(false);
      return;
    }
    const node = selection.node;
    setAlignState((node.attrs.align as Align) ?? "full");
    setCaption(node.attrs.caption ?? "");
    try {
      const dom = editor.view.nodeDOM(selection.from) as HTMLElement | null;
      if (!dom) { setVisible(false); return; }
      const rect = dom.getBoundingClientRect();
      setPos({ top: rect.top + window.scrollY - 52, left: rect.left + window.scrollX });
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", update);
    editor.on("blur", () => setVisible(false));
    return () => { editor.off("selectionUpdate", update); };
  }, [editor, update]);

  function applyAlign(a: Align) {
    setAlignState(a);
    editor?.chain().focus().updateAttributes("image", { align: a }).run();
  }

  function applyCaption() {
    editor?.chain().focus().updateAttributes("image", { caption }).run();
  }

  if (!mounted || !visible) return null;

  const ab = (a: Align, label: string, title: string) => (
    <button
      key={a}
      onClick={() => applyAlign(a)}
      title={title}
      className={`px-2 py-0.5 text-xs rounded transition-colors whitespace-nowrap ${align === a ? "bg-amber-500 text-white" : "hover:bg-zinc-700"}`}
    >
      {label}
    </button>
  );

  const Sep = () => <div className="w-px h-3 bg-zinc-700 shrink-0" />;

  const toolbar = (
    <div
      style={{ top: pos.top, left: pos.left, position: "absolute", zIndex: 9999 }}
      className="flex items-center gap-1 bg-zinc-900 text-white rounded-lg px-2 py-1.5 shadow-xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      {ab("left", "◧ Gauche", "Flotter à gauche")}
      <Sep />
      {ab("center", "⊟ Centre", "Centrer")}
      <Sep />
      {ab("right", "◨ Droite", "Flotter à droite")}
      <Sep />
      {ab("full", "⊞ Pleine", "Pleine largeur")}
      <Sep />
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={applyCaption}
        onKeyDown={(e) => { if (e.key === "Enter") { applyCaption(); } }}
        placeholder="Légende..."
        className="bg-zinc-800 text-white text-xs px-2 py-0.5 rounded border border-zinc-700 focus:outline-none focus:border-amber-400 w-32"
      />
    </div>
  );

  return createPortal(toolbar, document.body);
}
