import { NextResponse } from "next/server";
import { generateState } from "oslo/oauth2";
import { cookies } from "next/headers";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const state = generateState();
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google Client ID not configured" },
      { status: 500 },
    );
  }

  const baseUrl = getSafeBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return NextResponse.redirect(url);
}
