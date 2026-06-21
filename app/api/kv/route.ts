import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import db from "@/lib/db";

// GET  /api/kv?key=foo            → get value
// POST /api/kv { key, value, action: "set"|"increment", incrementBy? } → set / increment
// DELETE /api/kv?key=foo          → delete

async function getUserId(req: Request): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;
  return null;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  const record = await db.kVStore.findUnique({
    where: { userId_key: { userId, key } },
  });

  if (!record) return NextResponse.json({ found: false, value: null });
  return NextResponse.json({ found: true, value: record.value });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { key, value, action = "set", incrementBy = 1 } = body;

  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  if (action === "set") {
    await db.kVStore.upsert({
      where: { userId_key: { userId, key } },
      update: { value: String(value) },
      create: { userId, key, value: String(value) },
    });
    return NextResponse.json({ success: true, key, value: String(value) });
  }

  if (action === "increment") {
    const existing = await db.kVStore.findUnique({
      where: { userId_key: { userId, key } },
    });
    const current = parseInt(existing?.value ?? "0");
    if (isNaN(current)) {
      return NextResponse.json({ error: "Current value is not a number" }, { status: 400 });
    }
    const newValue = current + Number(incrementBy);
    await db.kVStore.upsert({
      where: { userId_key: { userId, key } },
      update: { value: String(newValue) },
      create: { userId, key, value: String(newValue) },
    });
    return NextResponse.json({ success: true, key, value: newValue });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  await db.kVStore.deleteMany({ where: { userId, key } });
  return NextResponse.json({ success: true, key });
}
