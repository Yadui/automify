import db from "@/lib/db";
import { NextResponse } from "next/server";
import axios from "axios";
import { getSafeBaseUrl } from "@/lib/utils";
import { decodeOAuthState, appendOAuthResult } from "@/lib/oauth-redirect";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const baseUrl = getSafeBaseUrl(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // userId (appId string) and returnTo are encoded in state by /api/auth/connect
  const decoded = decodeOAuthState(state);
  const userAppId = decoded.userId ?? null;   // string appId, e.g. "authjs:google:123"
  const returnUrl = decoded.returnTo || "/connections";

  if (!userAppId) {
    console.error("[discord/callback] No userId in state — missing or invalid state param");
    return NextResponse.redirect(`${baseUrl}/sign-in?returnTo=/connections`);
  }

  if (!code) {
    const errorPath = appendOAuthResult(returnUrl, { connectionError: "no_code" });
    return NextResponse.redirect(`${baseUrl}${errorPath}`);
  }

  try {
    // Prefer the same env var used to build the authorization URL (NEXT_PUBLIC_DISCORD_CLIENT_ID)
    // so both sides always use the same client_id. Fall back to DISCORD_CLIENT_ID for compat.
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[discord/callback] Missing credentials:", {
        clientId: clientId ? "set" : "MISSING",
        clientSecret: clientSecret ? "set" : "MISSING",
      });
      return NextResponse.redirect(`${baseUrl}/connections?connectionError=oauth_config`);
    }

    const redirectUri =
      process.env.DISCORD_REDIRECT_URI ||
      `${baseUrl}/api/oauth/discord/callback`;

    console.log("[discord/callback] Token exchange →", {
      clientId,
      redirectUri,
      codeLength: code.length,
    });

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(
      "https://discord.com/api/oauth2/token",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokens = response.data;

    // With webhook.incoming scope, Discord returns the webhook info directly
    // tokens.webhook contains: { id, name, channel_id, token, url, guild_id }
    const webhook = tokens.webhook;

    if (!webhook?.url) {
      console.error("[discord/callback] No webhook returned", tokens);
      return NextResponse.redirect(`${baseUrl}/connections?connectionError=no_webhook`);
    }

    // Persist using the same pattern as onDiscordConnect (discord-connections server action).
    // DiscordWebhook.userId references User.appId (string).
    const settings = {
      channelId: webhook.channel_id,
      webhookId: webhook.id,
      webhookName: webhook.name,
      webhookURL: webhook.url,
      guildName: webhook.guild?.name ?? "",
      guildId: webhook.guild_id,
    } satisfies Record<string, unknown>;
    const prismaSettings = settings as Prisma.InputJsonObject;

    const existingWebhook = await db.discordWebhook.findFirst({
      where: { userId: userAppId },
    });

    if (!existingWebhook) {
      await db.discordWebhook.create({
        data: {
          userId: userAppId,
          webhookId: webhook.id,
          channelId: webhook.channel_id,
          guildId: webhook.guild_id,
          name: webhook.name,
          url: webhook.url,
          guildName: webhook.guild?.name ?? "",
          connections: {
            create: {
              userId: userAppId,
              type: "Discord",
              settings: prismaSettings,
            },
          },
        },
      });
    } else {
      // Check if this specific channel already has a webhook
      const existingChannel = await db.discordWebhook.findUnique({
        where: { channelId: webhook.channel_id },
      });

      if (!existingChannel) {
        await db.discordWebhook.create({
          data: {
            userId: userAppId,
            webhookId: webhook.id,
            channelId: webhook.channel_id,
            guildId: webhook.guild_id,
            name: webhook.name,
            url: webhook.url,
            guildName: webhook.guild?.name ?? "",
            connections: {
              create: {
                userId: userAppId,
                type: "Discord",
                settings: prismaSettings,
              },
            },
          },
        });
      }
    }

    return NextResponse.redirect(`${baseUrl}${returnUrl}`);
  } catch (error: any) {
    console.error("Discord OAuth Callback Error:", error?.response?.data || error);
    const errorPath = appendOAuthResult(returnUrl, { connectionError: "oauth_failed" });
    return NextResponse.redirect(`${baseUrl}${errorPath}`);
  }
}
