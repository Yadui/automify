import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import axios from "axios";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid state or code" },
      { status: 400 },
    );
  }

  try {
    const baseUrl = getSafeBaseUrl(request);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const { access_token, id_token } = tokenResponse.data;

    // Fetch Google user profile
    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const googleUser = userResponse.data;

    if (!googleUser.email) {
      return NextResponse.json(
        { error: "No email found in Google profile" },
        { status: 400 },
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split("@")[0],
          profileImage: googleUser.picture,
        },
      });
    }

    // Link connection if it doesn't exist
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: user.id,
          provider: "google",
          providerAccountId: googleUser.id.toString(),
        },
      },
      update: {
        accessToken: access_token,
        status: "active",
      },
      create: {
        userId: user.id,
        provider: "google",
        providerAccountId: googleUser.id.toString(),
        accessToken: access_token,
        status: "active",
      },
    });

    // Create session
    // NOTE: Casting id to any to bypass Lucia string type requirement (Prisma adapter handles Int)
    const session = await lucia.createSession(user.id as any, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
