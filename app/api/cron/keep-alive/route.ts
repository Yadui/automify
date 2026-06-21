import { NextResponse } from "next/server";
import db from "@/lib/db";

// Vercel cron: runs every 2 days at midnight UTC (vercel.json)
// Keeps Neon DB warm so it doesn't suspend between real user requests.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_JOB_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lightweight ping — no table needed, just proves the connection is alive
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/keep-alive] DB ping failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
