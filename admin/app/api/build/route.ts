import { NextResponse } from "next/server";
import { triggerBuild, buildState, readLastBuild } from "@/lib/build";

export async function POST() {
  const started = triggerBuild();
  return NextResponse.json({ started, status: buildState.status });
}

export async function GET() {
  return NextResponse.json({
    status: buildState.status,
    startedAt: buildState.startedAt,
    logs: buildState.logs,
    lastBuild: readLastBuild(),
  });
}
