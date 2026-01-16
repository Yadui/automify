import { NextResponse } from "next/server";
import { lucia } from "@/lib/auth";
import { generateState } from "oslo/oauth2";
import { cookies } from "next/headers";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const state = generateState();
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub Client ID not configured" },
      { status: 500 }
    );
  }

  const baseUrl = getSafeBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "user:email");

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return NextResponse.redirect(url);
}
