import { spawn } from "child_process";
import path from "path";
import { readdirSync, writeFileSync, readFileSync, existsSync } from "fs";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

const LAST_BUILD_FILE = path.join(NOTA_ROOT, ".last-build");

export type BuildStatus = "idle" | "building" | "success" | "error";

export type LastBuild = {
  timestamp: number;
  publishedSlugs: string[];
};

export const buildState = {
  status: "idle" as BuildStatus,
  logs: [] as string[],
  startedAt: null as number | null,
};

export function readLastBuild(): LastBuild | null {
  if (!existsSync(LAST_BUILD_FILE)) return null;
  try {
    return JSON.parse(readFileSync(LAST_BUILD_FILE, "utf8")) as LastBuild;
  } catch {
    return null;
  }
}

function listDistSlugs(dir: string): string[] {
  const full = path.join(NOTA_ROOT, "dist", dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => `${dir}/${d.name}`);
}

function saveLastBuild() {
  // Content sections rendered as static routes: projects + photos (albums).
  const publishedSlugs = [...listDistSlugs("projects"), ...listDistSlugs("photos")];
  const data: LastBuild = { timestamp: Date.now(), publishedSlugs };
  writeFileSync(LAST_BUILD_FILE, JSON.stringify(data, null, 2));
}

export function triggerBuild(): boolean {
  if (buildState.status === "building") return false;
  buildState.status = "building";
  buildState.logs = [];
  buildState.startedAt = Date.now();

  const proc = spawn("npm", ["run", "build"], {
    cwd: NOTA_ROOT,
    shell: true,
  });

  const onData = (data: Buffer) => {
    buildState.logs.push(data.toString());
  };

  proc.stdout?.on("data", onData);
  proc.stderr?.on("data", onData);

  proc.on("close", (code) => {
    if (code !== 0) {
      buildState.status = "error";
      return;
    }
    saveLastBuild();
    publishContent(); // build OK → commit & push content to GitHub, then mark success
  });

  return true;
}

// Publish the admin-authored content (mdx + images) to GitHub after a successful build.
// Staged paths are scoped to content; gitignored runtime data (ideas.json, etc.) is skipped.
// A push failure is logged but does not fail the build — dist/ is already up to date locally.
function publishContent() {
  buildState.logs.push("\n[git] Publication du contenu sur GitHub…\n");
  const msg = `content: publish from admin (${new Date().toISOString()})`;
  const script =
    "git add src/content/projects src/content/albums public && " +
    "if git diff --cached --quiet; then echo '[git] aucun changement de contenu'; " +
    'else git commit -m "$COMMIT_MSG" && git push origin main && echo "[git] poussé sur origin/main"; fi';

  const git = spawn("sh", ["-c", script], {
    cwd: NOTA_ROOT,
    env: { ...process.env, COMMIT_MSG: msg },
  });

  const onData = (data: Buffer) => buildState.logs.push(data.toString());
  git.stdout?.on("data", onData);
  git.stderr?.on("data", onData);

  git.on("close", (code) => {
    if (code !== 0) {
      buildState.logs.push("[git] échec de la publication — le site local est à jour, pousser manuellement\n");
    }
    buildState.status = "success";
  });
}
