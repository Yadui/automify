import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Please login first." },
      { status: 401 }
    );
  }

  const baseUrl = getSafeBaseUrl(request);
  const url = new URL(request.url);
  const returnUrl = url.searchParams.get("returnUrl") || "/connections";

  // Encode returnUrl in state parameter to pass through OAuth flow
  const state = Buffer.from(JSON.stringify({ returnUrl })).toString("base64");

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: `${baseUrl}/api/oauth/google/callback`,
    response_type: "code",
    scope:
      "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return NextResponse.redirect(authUrl);
}
