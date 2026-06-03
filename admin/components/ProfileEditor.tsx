"use client";

import { useState } from "react";
import { ICON_NAMES, type Profile } from "@/lib/profile-schema";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors";

type ListKey = "work" | "education" | "certifications" | "skills" | "hobbies";

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

function Area({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${inputClass} resize-y`} />
    </label>
  );
}

function Group({ title, count, onAdd, addLabel, children }: { title: string; count?: number; onAdd?: () => void; addLabel?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800">
          {title}
          {typeof count === "number" && <span className="text-zinc-400 font-normal"> ({count})</span>}
        </h2>
        {onAdd && (
          <button type="button" onClick={onAdd} className="px-2.5 py-1 text-xs bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">
            + {addLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function ItemCard({ title, onUp, onDown, onRemove, children }: { title: string; onUp: () => void; onDown: () => void; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500">{title}</span>
        <div className="flex gap-1">
          <button type="button" onClick={onUp} className="w-6 h-6 text-xs text-zinc-500 rounded hover:bg-zinc-100">↑</button>
          <button type="button" onClick={onDown} className="w-6 h-6 text-xs text-zinc-500 rounded hover:bg-zinc-100">↓</button>
          <button type="button" onClick={onRemove} className="w-6 h-6 text-xs text-red-400 rounded hover:bg-red-50">✕</button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ProfileEditor({ initial }: { initial: Profile }) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | "saved" | string>(null);

  const setId = (field: keyof Profile["identity"], value: string) =>
    setProfile((p) => ({ ...p, identity: { ...p.identity, [field]: value } }));

  // Listes hétérogènes : type d'item volontairement large dans les helpers
  // (les champs sont garantis par le rendu typé ci-dessous + normalisés côté serveur).
  const updateList = (key: ListKey, idx: number, patch: Record<string, unknown>) =>
    setProfile((p) => ({ ...p, [key]: (p[key] as unknown as Record<string, unknown>[]).map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  const addItem = (key: ListKey, tpl: Record<string, unknown>) =>
    setProfile((p) => ({ ...p, [key]: [...(p[key] as unknown as Record<string, unknown>[]), tpl] }));
  const removeItem = (key: ListKey, idx: number) =>
    setProfile((p) => ({ ...p, [key]: (p[key] as unknown[]).filter((_, i) => i !== idx) }));
  const moveItem = (key: ListKey, idx: number, dir: -1 | 1) =>
    setProfile((p) => {
      const arr = [...(p[key] as unknown[])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...p, [key]: arr };
    });

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Erreur lors de la sauvegarde");
      }
      setStatus("saved");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  const id = profile.identity;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-200 bg-white shrink-0">
        <span className="text-zinc-700 text-sm font-medium">Profil</span>
        <span className="text-zinc-300 text-xs">— CV, compétences, certifications</span>
        <div className="flex-1" />
        {status === "saved" && <span className="text-xs text-green-600">Enregistré ✓</span>}
        {status && status !== "saved" && <span className="text-xs text-red-500">{status}</span>}
        <button onClick={save} disabled={saving} className="px-4 py-1.5 text-sm bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
          {saving ? "..." : "Sauvegarder"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-10">
          <p className="text-xs text-zinc-400">
            Modifie ton CV ici, puis clique <b>Sauvegarder</b>. Les changements apparaissent sur le site après un <b>build</b> (bouton publier).
          </p>

          {/* Identité */}
          <Group title="Identité">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom" value={id.name} onChange={(v) => setId("name", v)} />
              <Field label="Initiales" value={id.initials} onChange={(v) => setId("initials", v)} placeholder="SP" />
              <Field label="Localisation" value={id.location} onChange={(v) => setId("location", v)} />
              <Field label="Lien localisation" value={id.locationLink} onChange={(v) => setId("locationLink", v)} />
              <Field label="Email" value={id.email} onChange={(v) => setId("email", v)} />
              <Field label="Avatar (URL)" value={id.avatarUrl} onChange={(v) => setId("avatarUrl", v)} placeholder="/Profil-Pic.webp" />
            </div>
            <Area label="Accroche (hero)" value={id.description} onChange={(v) => setId("description", v)} rows={2} />
            <Area label="À propos (résumé)" value={id.summary} onChange={(v) => setId("summary", v)} rows={5} />
          </Group>

          {/* Expériences */}
          <Group title="Expériences" count={profile.work.length} addLabel="Expérience" onAdd={() => addItem("work", { company: "", href: "", badges: [], location: "", title: "", logoUrl: "", start: "", end: "", description: "" })}>
            <div className="space-y-3">
              {profile.work.map((w, i) => (
                <ItemCard key={i} title={w.company || `Expérience ${i + 1}`} onUp={() => moveItem("work", i, -1)} onDown={() => moveItem("work", i, 1)} onRemove={() => removeItem("work", i)}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Entreprise" value={w.company} onChange={(v) => updateList("work", i, { company: v })} />
                    <Field label="Poste" value={w.title} onChange={(v) => updateList("work", i, { title: v })} />
                    <Field label="Lien" value={w.href} onChange={(v) => updateList("work", i, { href: v })} />
                    <Field label="Logo (URL)" value={w.logoUrl} onChange={(v) => updateList("work", i, { logoUrl: v })} />
                    <Field label="Lieu" value={w.location} onChange={(v) => updateList("work", i, { location: v })} />
                    <Field label="Badges (séparés par virgule)" value={w.badges.join(", ")} onChange={(v) => updateList("work", i, { badges: v.split(",").map((b) => b.trim()).filter(Boolean) })} />
                    <Field label="Début" value={w.start} onChange={(v) => updateList("work", i, { start: v })} placeholder="Janvier 2024" />
                    <Field label="Fin (vide = en cours)" value={w.end} onChange={(v) => updateList("work", i, { end: v })} />
                  </div>
                  <Area label="Description" value={w.description} onChange={(v) => updateList("work", i, { description: v })} rows={3} />
                </ItemCard>
              ))}
            </div>
          </Group>

          {/* Formation */}
          <Group title="Formation" count={profile.education.length} addLabel="Formation" onAdd={() => addItem("education", { school: "", href: "", degree: "", logoUrl: "", start: "", end: "" })}>
            <div className="space-y-3">
              {profile.education.map((e, i) => (
                <ItemCard key={i} title={e.school || `Formation ${i + 1}`} onUp={() => moveItem("education", i, -1)} onDown={() => moveItem("education", i, 1)} onRemove={() => removeItem("education", i)}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="École" value={e.school} onChange={(v) => updateList("education", i, { school: v })} />
                    <Field label="Lien" value={e.href} onChange={(v) => updateList("education", i, { href: v })} />
                    <Field label="Logo (URL)" value={e.logoUrl} onChange={(v) => updateList("education", i, { logoUrl: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Début" value={e.start} onChange={(v) => updateList("education", i, { start: v })} />
                      <Field label="Fin" value={e.end} onChange={(v) => updateList("education", i, { end: v })} />
                    </div>
                  </div>
                  <Field label="Diplôme" value={e.degree} onChange={(v) => updateList("education", i, { degree: v })} />
                </ItemCard>
              ))}
            </div>
          </Group>

          {/* Certifications */}
          <Group title="Certifications" count={profile.certifications.length} addLabel="Certification" onAdd={() => addItem("certifications", { name: "", issuer: "", date: "", href: "" })}>
            <div className="space-y-3">
              {profile.certifications.map((c, i) => (
                <ItemCard key={i} title={c.name || `Certification ${i + 1}`} onUp={() => moveItem("certifications", i, -1)} onDown={() => moveItem("certifications", i, 1)} onRemove={() => removeItem("certifications", i)}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Intitulé" value={c.name} onChange={(v) => updateList("certifications", i, { name: v })} />
                    <Field label="Organisme" value={c.issuer} onChange={(v) => updateList("certifications", i, { issuer: v })} />
                    <Field label="Date" value={c.date} onChange={(v) => updateList("certifications", i, { date: v })} placeholder="2026" />
                    <Field label="Lien (optionnel)" value={c.href} onChange={(v) => updateList("certifications", i, { href: v })} />
                  </div>
                </ItemCard>
              ))}
              {profile.certifications.length === 0 && (
                <p className="text-xs text-zinc-400 italic">Aucune certification — clique « + Certification » pour en ajouter une.</p>
              )}
            </div>
          </Group>

          {/* Compétences */}
          <Group title="Compétences" count={profile.skills.length} addLabel="Compétence" onAdd={() => addItem("skills", { name: "", icon: "ShieldCheck", color: "#6366f1" })}>
            <div className="space-y-2">
              {profile.skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s.name} onChange={(e) => updateList("skills", i, { name: e.target.value })} placeholder="Compétence" className={`${inputClass} flex-1`} />
                  <select value={s.icon} onChange={(e) => updateList("skills", i, { icon: e.target.value })} className={`${inputClass} w-36`}>
                    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input value={s.color} onChange={(e) => updateList("skills", i, { color: e.target.value })} placeholder="#6366f1" className={`${inputClass} w-24`} />
                  <span className="w-5 h-5 rounded shrink-0 border border-zinc-200" style={{ background: s.color || "transparent" }} />
                  <button type="button" onClick={() => removeItem("skills", i)} className="w-6 h-6 text-xs text-red-400 rounded hover:bg-red-50 shrink-0">✕</button>
                </div>
              ))}
            </div>
          </Group>

          {/* Hobbies */}
          <Group title="En dehors du bureau" count={profile.hobbies.length} addLabel="Hobby" onAdd={() => addItem("hobbies", { name: "", icon: "Globe", color: "#0d9488" })}>
            <div className="space-y-2">
              {profile.hobbies.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={h.name} onChange={(e) => updateList("hobbies", i, { name: e.target.value })} placeholder="Centre d'intérêt" className={`${inputClass} flex-1`} />
                  <select value={h.icon} onChange={(e) => updateList("hobbies", i, { icon: e.target.value })} className={`${inputClass} w-36`}>
                    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input value={h.color} onChange={(e) => updateList("hobbies", i, { color: e.target.value })} placeholder="#0d9488" className={`${inputClass} w-24`} />
                  <span className="w-5 h-5 rounded shrink-0 border border-zinc-200" style={{ background: h.color || "transparent" }} />
                  <button type="button" onClick={() => removeItem("hobbies", i)} className="w-6 h-6 text-xs text-red-400 rounded hover:bg-red-50 shrink-0">✕</button>
                </div>
              ))}
            </div>
          </Group>
        </div>
      </div>
    </div>
  );
}
