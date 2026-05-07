import { spawn } from "child_process";
import path from "path";

const NOTA_ROOT = process.env.NOTA_PATH
  ? path.resolve(process.cwd(), process.env.NOTA_PATH)
  : path.resolve(process.cwd(), "..");

export type BuildStatus = "idle" | "building" | "success" | "error";

export const buildState = {
  status: "idle" as BuildStatus,
  logs: [] as string[],
  startedAt: null as number | null,
};

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
  });

  return true;
}
