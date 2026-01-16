import { lucia } from "@/lib/auth";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "bcryptjs";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// No local prisma instance needed

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 10);

  try {
    const user = await db.user.create({
      data: {
        email,
        hashedPassword,
        name,
      },
    });

    const session = await lucia.createSession(user.id as any, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
