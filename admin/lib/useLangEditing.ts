"use client";

import { useEffect, useRef, useState } from "react";
import { TRANSLATABLE, type Lang } from "@/lib/i18n";

// Logique d'édition multilingue partagée par les éditeurs (projet, album, blog, profil) :
// onglets FR/EN/ES/PT, garde anti-perte de modifications, traduction vers une langue cible.
// L'éditeur fournit la (dé)sérialisation de son état et l'application des données chargées ;
// le hook orchestre le reste.
//
// `serialize` (depuis l'état) et `serializeData` (depuis les données chargées) DOIVENT
// produire le même format pour que la détection de modifications soit fiable.
interface Options<T> {
  exists: boolean;                       // un contenu persisté existe (slug ou profil)
  enAlwaysAvailable?: boolean;           // profil : le GET de chaque locale renvoie toujours 200 (repli FR)
  getUrl: (lang: Lang) => string;        // URL GET/PUT incluant ?lang
  translateUrl: (target: Lang) => string; // URL POST de traduction vers la langue cible
  serialize: () => string;               // empreinte de l'état courant (pour isDirty)
  serializeData: (data: T) => string;    // empreinte des données chargées (même format)
  apply: (data: T) => void;              // applique les données chargées à l'état de l'éditeur
}

export function useLangEditing<T>(opts: Options<T>) {
  const { exists, enAlwaysAvailable = false, getUrl, translateUrl, serialize, serializeData, apply } = opts;

  const [lang, setLang] = useState<Lang>("fr");
  const [translating, setTranslating] = useState<Lang | null>(null);
  const [transExists, setTransExists] = useState<Record<Lang, boolean>>(() => ({
    fr: true,
    en: enAlwaysAvailable,
    es: enAlwaysAvailable,
    pt: enAlwaysAvailable,
  }));
  const [status, setStatus] = useState<null | "saved" | string>(null);

  const baseline = useRef<string | null>(null);
  if (baseline.current === null) baseline.current = serialize();
  const isDirty = () => baseline.current !== serialize();
  // À appeler par l'éditeur après une sauvegarde réussie (l'état courant devient la référence).
  const markClean = () => { baseline.current = serialize(); };

  // Détecte quelles traductions existent déjà (sauf profil, toujours dispo via repli FR).
  useEffect(() => {
    if (enAlwaysAvailable || !exists) return;
    let cancelled = false;
    Promise.all(
      TRANSLATABLE.map((l) =>
        fetch(getUrl(l))
          .then((r) => [l, r.ok] as const)
          .catch(() => [l, false] as const)
      )
    ).then((res) => {
      if (cancelled) return;
      setTransExists((prev) => {
        const next = { ...prev };
        res.forEach(([l, ok]) => (next[l] = ok));
        return next;
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exists]);

  async function loadInto(l: Lang) {
    const res = await fetch(getUrl(l));
    if (!res.ok) return false;
    const data = (await res.json()) as T;
    apply(data);
    baseline.current = serializeData(data);
    setLang(l);
    setStatus(null);
    return true;
  }

  async function switchLang(l: Lang) {
    if (l === lang || !exists) return;
    if (isDirty() && !confirm("Modifications non sauvegardées perdues en changeant de langue. Continuer ?")) return;
    if (!(await loadInto(l))) setStatus(`Pas de version ${l.toUpperCase()}`);
  }

  async function translate(target: Lang) {
    if (!exists || target === "fr") return;
    if (isDirty() && !confirm("Modifications non sauvegardées perdues par la traduction. Continuer ?")) return;
    setTranslating(target);
    setStatus(null);
    try {
      const res = await fetch(translateUrl(target), { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Erreur de traduction");
      }
      setTransExists((prev) => ({ ...prev, [target]: true }));
      await loadInto(target);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Erreur de traduction");
    } finally {
      setTranslating(null);
    }
  }

  return { lang, translating, transExists, setTransExists, status, setStatus, isDirty, markClean, switchLang, translate };
}
