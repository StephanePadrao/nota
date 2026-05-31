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

function saveLastBuild() {
  const distBlog = path.join(NOTA_ROOT, "dist", "blog");
  let publishedSlugs: string[] = [];
  if (existsSync(distBlog)) {
    publishedSlugs = readdirSync(distBlog, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }
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
    buildState.status = code === 0 ? "success" : "error";
    if (code === 0) saveLastBuild();
  });

  return true;
}
