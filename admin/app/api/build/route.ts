import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { triggerBuild, buildState, readLastBuild } from "@/lib/build";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const started = triggerBuild();
  return NextResponse.json({ started, status: buildState.status });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    status: buildState.status,
    startedAt: buildState.startedAt,
    logs: buildState.logs,
    lastBuild: readLastBuild(),
  });
}
