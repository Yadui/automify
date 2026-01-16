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
  const storedState = cookieStore.get("github_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid state or code" },
      { status: 400 }
    );
  }

  try {
    const baseUrl = getSafeBaseUrl(request);
    const redirectUri = `${baseUrl}/api/auth/github/callback`;
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Fetch GitHub user profile
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const githubUser = userResponse.data;

    // Fetch GitHub user emails (to handle private emails)
    const emailsResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const primaryEmail =
      emailsResponse.data.find((email: any) => email.primary && email.verified)
        ?.email || emailsResponse.data[0]?.email;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No verified email found on GitHub" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: primaryEmail },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          profileImage: githubUser.avatar_url,
        },
      });
    }

    // Link connection if it doesn't exist
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: user.id,
          provider: "github",
          providerAccountId: githubUser.id.toString(),
        },
      },
      update: {
        accessToken: access_token,
        status: "active",
      },
      create: {
        userId: user.id,
        provider: "github",
        providerAccountId: githubUser.id.toString(),
        accessToken: access_token,
        status: "active",
      },
    });

    // Create session
    // NOTE: Even though Lucia's type expects a string, the PrismaAdapter for Lucia v3
    // requires the ID to match the database type (Int). Passing a number via 'any'
    // allows the adapter to correctly insert it into the Postgres Int field.
    const session = await lucia.createSession(user.id as any, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
