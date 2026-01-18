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
      process.env.DISCORD_REDIRECT_URI ||
      `${baseUrl}/api/oauth/discord/callback`;
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(
      "https://discord.com/api/oauth2/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokens = response.data;

    // With webhook.incoming scope, Discord returns the webhook info directly
    // tokens.webhook contains: { id, name, channel_id, token, url, guild_id, ... }
    const webhook = tokens.webhook;

    if (!webhook || !webhook.url) {
      console.error("Discord OAuth Error: No webhook returned", tokens);
      return NextResponse.json(
        {
          error:
            "No webhook was created. Please try again and select a channel.",
        },
        { status: 400 }
      );
    }

    // Upsert the connection using webhook.id as providerAccountId
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: Number(user.id),
          provider: "discord",
          providerAccountId: webhook.id,
        },
      },
      update: {
        accessToken: webhook.url, // Store the webhook URL for posting
        metadata: {
          webhookId: webhook.id,
          webhookName: webhook.name,
          webhookToken: webhook.token,
          channelId: webhook.channel_id,
          guildId: webhook.guild_id,
        },
        status: "active",
      },
      create: {
        userId: Number(user.id),
        provider: "discord",
        providerAccountId: webhook.id,
        accessToken: webhook.url,
        metadata: {
          webhookId: webhook.id,
          webhookName: webhook.name,
          webhookToken: webhook.token,
          channelId: webhook.channel_id,
          guildId: webhook.guild_id,
        },
        status: "active",
      },
    });

    // Redirect to original page
    return NextResponse.redirect(`${baseUrl}${returnUrl}`);
  } catch (error: any) {
    console.error(
      "Discord OAuth Callback Error:",
      error?.response?.data || error
    );
    return NextResponse.json(
      { error: "Failed to link Discord account" },
      { status: 500 }
    );
  }
}
