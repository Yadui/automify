import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import axios from "axios";
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

  try {
    const baseUrl = getSafeBaseUrl(request);
    const redirectUri =
      process.env.SLACK_REDIRECT_URI || `${baseUrl}/api/oauth/slack/callback`;
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokens = response.data;
    if (!tokens.ok) {
      throw new Error(tokens.error || "Failed to exchange Slack code");
    }

    // Upsert the connection using team.id as providerAccountId
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: Number(user.id),
          provider: "slack",
          providerAccountId: tokens.team.id,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
        scopes: tokens.scope || undefined,
        metadata: {
          teamName: tokens.team.name,
          botUserId: tokens.bot_user_id,
          authedUserId: tokens.authed_user?.id,
          appId: tokens.app_id,
        },
        status: "active",
      },
      create: {
        userId: Number(user.id),
        provider: "slack",
        providerAccountId: tokens.team.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
        scopes: tokens.scope,
        metadata: {
          teamName: tokens.team.name,
          botUserId: tokens.bot_user_id,
          authedUserId: tokens.authed_user?.id,
          appId: tokens.app_id,
        },
        status: "active",
      },
    });

    // Redirect to original page
    return NextResponse.redirect(`${baseUrl}${returnUrl}`);
  } catch (error) {
    console.error("Slack OAuth Callback Error:", error);
    return NextResponse.json(
      { error: "Failed to link Slack account" },
      { status: 500 }
    );
  }
}
