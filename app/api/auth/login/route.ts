import { lucia } from "@/lib/auth";
import { compare } from "bcryptjs";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Incorrect email or password" },
        { status: 400 }
      );
    }

    const validPassword = await compare(password, user.hashedPassword);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Incorrect email or password" },
        { status: 400 }
      );
    }

    const session = await lucia.createSession(user.id as any, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
