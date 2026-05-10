import { NextRequest, NextResponse } from "next/server";
import { onGoogleDriveConnect } from "@/app/(main)/connections/_actions/google-connection";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthRedirectUrl } from "@/lib/oauth-redirect";
import { getOAuthProviderCredentials } from "@/lib/oauth-provider-config";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const user = await getAppUser();

  if (!user) {
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "auth_failed" })
    );
  }

  if (!code) {
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "no_code" })
    );
  }

  const googleCredentials = getOAuthProviderCredentials("google");

  if (!googleCredentials) {
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "google_config_error" })
    );
  }

  try {
    const redirectUri = new URL("/api/auth/callback/googleDrive", req.nextUrl.origin).toString();

    // Exchange the temporary code for tokens
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleCredentials.clientId,
        client_secret: googleCredentials.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description);
    }

    // Save the access token and, most importantly, the refresh token
    await onGoogleDriveConnect(
      data.access_token,
      data.refresh_token,
      user.id,
      data.scope
    );

    // Redirect to the frontend with a success message
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionStatus: "google_success" })
    );
  } catch (error) {
    console.error("Google OAuth Callback Error:", error);
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "google_failed" })
    );
  }
}
