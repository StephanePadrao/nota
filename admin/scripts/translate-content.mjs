#!/usr/bin/env node
// Traduit en lot le contenu FR → ES + PT (profil, projets, albums, blog) via Groq.
// À lancer depuis le dossier admin/ (clé Groq dans admin/.env) :
//   node scripts/translate-content.mjs            # es + pt
//   node scripts/translate-content.mjs es         # une seule langue
// Idempotent : réécrit les fichiers <lang>/<slug>.mdx et profile.<lang>.json.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Groq from "groq-sdk";

const ADMIN_DIR = process.cwd(); // doit être admin/
const NOTA_ROOT = path.resolve(ADMIN_DIR, "..");

if (!process.env.GROQ_API_KEY) {
  try {
    const env = fs.readFileSync(path.join(ADMIN_DIR, ".env"), "utf8");
    const m = env.match(/^\s*GROQ_API_KEY\s*=\s*(.*)$/m);
    if (m) process.env.GROQ_API_KEY = m[1].trim().replace(/^["']|["']$/g, "");
  } catch { /* noop */ }
}
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY manquante (env ou admin/.env)");
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";
const NAMES = { en: "English", es: "Spanish", pt: "Portuguese" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Filtre optionnel `--only=slug1,slug2` : ne traduire que ces slugs de base (sinon tout).
const cliArgs = process.argv.slice(2);
const onlyArg = cliArgs.find((a) => a.startsWith("--only="));
const onlySlugs = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()).filter(Boolean) : null;

function sysPrompt(target) {
  const name = NAMES[target];
  return `You translate the author's French portfolio and blog content into natural, idiomatic ${name}.
CRITICAL RULES:
- Translate French to ${name}. Keep a direct, concrete, jargon-free voice.
- Titles and headings: write them in natural, idiomatic ${name} using sentence case (capitalize only the first word and proper nouns). Never Capitalize Every Word. Keep them short and punchy, not literal word-for-word.
- Preserve Markdown/MDX structure EXACTLY: headings (#), lists, blockquotes (>), links, image syntax ![alt](url), tables, bold/italic, line breaks.
- NEVER translate or alter: code, fenced code-block contents and language tags, JSX/MDX tags and attributes, import/export lines, URLs, file paths, technology and brand names, proper nouns, identifiers, numbers and units.
- Inside Mermaid or other diagram fences, translate ONLY quoted human-readable labels; keep node IDs, arrows and syntax intact.
- Do not add, remove or reorder content. Output ONLY the translation, no commentary, no surrounding quotes, no extra code fences.`;
}

async function withRetry(fn, label) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const wait = attempt * 8000;
      console.warn(`    ! ${label} échec (essai ${attempt}/4) : ${err?.message ?? err}. Pause ${wait / 1000}s`);
      if (attempt === 4) throw err;
      await sleep(wait);
    }
  }
}

async function tText(text, target) {
  if (!text || !text.trim()) return text ?? "";
  return withRetry(async () => {
    const r = await groq.chat.completions.create({
      model: MODEL, temperature: 0.2, max_tokens: 8192,
      messages: [{ role: "system", content: sysPrompt(target) }, { role: "user", content: text }],
    });
    return (r.choices[0]?.message?.content ?? "").trim();
  }, "tText");
}

async function tFields(fields, target) {
  const entries = Object.entries(fields).filter(([, v]) => v && String(v).trim());
  if (!entries.length) return {};
  return withRetry(async () => {
    const r = await groq.chat.completions.create({
      model: MODEL, temperature: 0.2, max_tokens: 4096, response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sysPrompt(target) + `\n\nReturn a JSON object with EXACTLY the same keys as the input; translate each string value to ${NAMES[target]}. Do not add, remove or rename keys.` },
        { role: "user", content: JSON.stringify(Object.fromEntries(entries)) },
      ],
    });
    const raw = r.choices[0]?.message?.content ?? "{}";
    let parsed;
    try { parsed = JSON.parse(raw); } catch { const m = raw.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : {}; }
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === "string"));
  }, "tFields");
}

const listMdx = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && !f.startsWith("_")) : [];

// Collections : quels champs prose du frontmatter traduire (le reste est conservé tel quel).
const COLLECTIONS = [
  { dir: "src/content/projects", fields: ["title", "description", "dates"] },
  { dir: "src/content/albums", fields: ["title", "summary"], photos: true },
  { dir: "src/content/blog", fields: ["title", "description"] },
];

async function translateCollection(col, target) {
  const baseDir = path.join(NOTA_ROOT, col.dir);
  const outDir = path.join(baseDir, target);
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of listMdx(baseDir)) {
    const slug = file.replace(/\.mdx$/, "");
    if (onlySlugs && !onlySlugs.includes(slug)) continue;
    const { data, content } = matter(fs.readFileSync(path.join(baseDir, file), "utf8"));
    const input = {};
    for (const f of col.fields) if (typeof data[f] === "string") input[f] = data[f];
    const tr = await tFields(input, target);
    for (const f of col.fields) if (tr[f]) data[f] = tr[f];
    if (col.photos && Array.isArray(data.photos)) {
      const altIn = {};
      data.photos.forEach((p, i) => { if (p?.alt) altIn[`a${i}`] = p.alt; });
      const altTr = await tFields(altIn, target);
      data.photos = data.photos.map((p, i) => ({ ...p, alt: altTr[`a${i}`] ?? p.alt }));
    }
    const body = await tText(content, target);
    fs.writeFileSync(path.join(outDir, file), matter.stringify(body.trim() + "\n", data), "utf8");
    console.log(`  ${target}/${col.dir.split("/").pop()}/${slug}`);
  }
}

async function translateProfile(target) {
  const frFile = path.join(NOTA_ROOT, "src/data/profile.json");
  if (!fs.existsSync(frFile)) return;
  const fr = JSON.parse(fs.readFileSync(frFile, "utf8"));
  const f = { desc: fr.identity?.description ?? "", summary: fr.identity?.summary ?? "" };
  (fr.work ?? []).forEach((w, i) => { f[`w${i}t`] = w.title ?? ""; f[`w${i}d`] = w.description ?? ""; (w.badges ?? []).forEach((b, j) => (f[`w${i}b${j}`] = b)); });
  (fr.education ?? []).forEach((e, i) => (f[`e${i}`] = e.degree ?? ""));
  (fr.skills ?? []).forEach((s, i) => (f[`s${i}`] = s.name ?? ""));
  (fr.hobbies ?? []).forEach((h, i) => (f[`h${i}`] = h.name ?? ""));
  (fr.certifications ?? []).forEach((c, i) => { f[`c${i}n`] = c.name ?? ""; f[`c${i}i`] = c.issuer ?? ""; });
  const tr = await tFields(f, target);
  const pick = (k, fb) => tr[k] ?? fb;
  const out = {
    identity: { ...fr.identity, description: pick("desc", fr.identity?.description ?? ""), summary: pick("summary", fr.identity?.summary ?? "") },
    work: (fr.work ?? []).map((w, i) => ({ ...w, title: pick(`w${i}t`, w.title), description: pick(`w${i}d`, w.description), badges: (w.badges ?? []).map((b, j) => pick(`w${i}b${j}`, b)) })),
    education: (fr.education ?? []).map((e, i) => ({ ...e, degree: pick(`e${i}`, e.degree) })),
    certifications: (fr.certifications ?? []).map((c, i) => ({ ...c, name: pick(`c${i}n`, c.name), issuer: pick(`c${i}i`, c.issuer) })),
    skills: (fr.skills ?? []).map((s, i) => ({ ...s, name: pick(`s${i}`, s.name) })),
    hobbies: (fr.hobbies ?? []).map((h, i) => ({ ...h, name: pick(`h${i}`, h.name) })),
  };
  fs.writeFileSync(path.join(NOTA_ROOT, `src/data/profile.${target}.json`), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`  ${target}/profile`);
}

const targets = cliArgs.filter((a) => !a.startsWith("--") && NAMES[a]);
for (const target of (targets.length ? targets : ["es", "pt"])) {
  console.log(`\n=== ${NAMES[target]} (${target}) ===`);
  // Avec --only (ciblage de contenus), on ne touche pas au profil.
  if (!onlySlugs) await translateProfile(target);
  for (const col of COLLECTIONS) await translateCollection(col, target);
}
console.log("\nTraduction terminée.");
