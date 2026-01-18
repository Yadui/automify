import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Parse returnUrl from state
  let returnUrl = "/connections";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      returnUrl = decoded.returnUrl || "/connections";
    } catch {
      // Invalid state, use default
    }
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const baseUrl = getSafeBaseUrl(request);
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/oauth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const userRes = await drive.about.get({ fields: "user" });
    const googleUser = userRes.data.user;

    if (!googleUser || !googleUser.permissionId) {
      throw new Error("Could not retrieve Google user info");
    }

    // Upsert the connection
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: Number(user.id),
          provider: "google",
          providerAccountId: googleUser.permissionId,
        },
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
        scopes: tokens.scope || undefined,
        metadata: {
          email: googleUser.emailAddress,
          displayName: googleUser.displayName,
          photoLink: googleUser.photoLink,
        },
        status: "active",
      },
      create: {
        userId: Number(user.id),
        provider: "google",
        providerAccountId: googleUser.permissionId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
        scopes: tokens.scope,
        metadata: {
          email: googleUser.emailAddress,
          displayName: googleUser.displayName,
          photoLink: googleUser.photoLink,
        },
        status: "active",
      },
    });

    // Redirect to the original page (workflow editor or connections page)
    return NextResponse.redirect(`${baseUrl}${returnUrl}`);
  } catch (error) {
    console.error("Google OAuth Callback Error:", error);
    return NextResponse.json(
      { error: "Failed to link Google account" },
      { status: 500 }
    );
  }
}
