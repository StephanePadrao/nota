"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

// Logique d'édition bilingue partagée par les éditeurs (projet, album, profil) :
// onglets FR/EN, garde anti-perte de modifications, traduction. L'éditeur fournit
// la (dé)sérialisation de son état et l'application des données chargées ; le hook
// orchestre le reste.
//
// `serialize` (depuis l'état) et `serializeData` (depuis les données chargées)
// DOIVENT produire le même format pour que la détection de modifications soit fiable.
interface Options<T> {
  exists: boolean;                  // un contenu persisté existe (slug ou profil)
  enAlwaysAvailable?: boolean;      // profil : le GET EN renvoie toujours 200 (repli FR)
  getUrl: (lang: Lang) => string;   // URL GET/PUT incluant ?lang
  translateUrl: () => string;       // URL POST de traduction
  serialize: () => string;          // empreinte de l'état courant (pour isDirty)
  serializeData: (data: T) => string; // empreinte des données chargées (même format)
  apply: (data: T) => void;         // applique les données chargées à l'état de l'éditeur
}

export function useLangEditing<T>(opts: Options<T>) {
  const { exists, enAlwaysAvailable = false, getUrl, translateUrl, serialize, serializeData, apply } = opts;

  const [lang, setLang] = useState<Lang>("fr");
  const [translating, setTranslating] = useState(false);
  const [enExists, setEnExists] = useState(enAlwaysAvailable);
  const [status, setStatus] = useState<null | "saved" | string>(null);

  const baseline = useRef<string | null>(null);
  if (baseline.current === null) baseline.current = serialize();
  const isDirty = () => baseline.current !== serialize();
  // À appeler par l'éditeur après une sauvegarde réussie (l'état courant devient la référence).
  const markClean = () => { baseline.current = serialize(); };

  // Active l'onglet EN si une traduction existe déjà (sauf profil, toujours dispo).
  useEffect(() => {
    if (enAlwaysAvailable || !exists) return;
    fetch(getUrl("en")).then((r) => setEnExists(r.ok)).catch(() => setEnExists(false));
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

  async function translate() {
    if (!exists) return;
    if (isDirty() && !confirm("Modifications non sauvegardées perdues par la traduction. Continuer ?")) return;
    setTranslating(true);
    setStatus(null);
    try {
      const res = await fetch(translateUrl(), { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Erreur de traduction");
      }
      setEnExists(true);
      await loadInto("en");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Erreur de traduction");
    } finally {
      setTranslating(false);
    }
  }

  return { lang, translating, enExists, setEnExists, status, setStatus, isDirty, markClean, switchLang, translate };
}
