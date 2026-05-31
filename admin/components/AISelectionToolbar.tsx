"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor | null;
}

interface Position {
  top: number;
  left: number;
}

export default function AISelectionToolbar({ editor }: ToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Position>({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const updatePosition = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) { setVisible(false); return; }
    const text = editor.state.doc.textBetween(from, to, " ").trim();
    if (!text) { setVisible(false); return; }
    setSelectedText(text);
    try {
      const coords = editor.view.coordsAtPos(from);
      setPos({ top: coords.top + window.scrollY - 48, left: coords.left + window.scrollX });
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", updatePosition);
    editor.on("blur", () => setVisible(false));
    return () => {
      editor.off("selectionUpdate", updatePosition);
    };
  }, [editor, updatePosition]);

  async function applyAI(action: "correct" | "rewrite") {
    if (!editor || !selectedText) return;
    setLoading(action);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        editor.chain().focus().insertContent(data.result).run();
        setVisible(false);
      }
    } finally {
      setLoading(null);
    }
  }

  if (!mounted || !visible) return null;

  const toolbar = (
    <div
      style={{ top: pos.top, left: pos.left, position: "absolute", zIndex: 9999 }}
      className="flex items-center gap-1 bg-zinc-900 text-white rounded-lg px-1.5 py-1 shadow-xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={() => applyAI("correct")}
        disabled={!!loading}
        className="px-2 py-0.5 text-xs rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {loading === "correct" ? "..." : "✓ Corriger"}
      </button>
      <div className="w-px h-3 bg-zinc-700" />
      <button
        onClick={() => applyAI("rewrite")}
        disabled={!!loading}
        className="px-2 py-0.5 text-xs rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {loading === "rewrite" ? "..." : "↺ Reformuler"}
      </button>
    </div>
  );

  return createPortal(toolbar, document.body);
}
