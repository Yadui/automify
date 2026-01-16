"use server";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import axios from "axios";

export const onDiscordConnect = async (
  channel_id: string,
  webhook_id: string,
  webhook_name: string,
  webhook_url: string,
  userId: number,
  guild_name: string,
  guild_id: string
) => {
  if (!webhook_id) return;

  await db.connection.upsert({
    where: {
      userId_provider_providerAccountId: {
        userId,
        provider: "discord",
        providerAccountId: webhook_id,
      },
    },
    update: {
      accessToken: webhook_url, // We store the webhook URL as the token for Discord
      metadata: {
        channelId: channel_id,
        webhookName: webhook_name,
        guildName: guild_name,
        guildId: guild_id,
      },
      status: "active",
    },
    create: {
      userId,
      provider: "discord",
      providerAccountId: webhook_id,
      accessToken: webhook_url,
      metadata: {
        channelId: channel_id,
        webhookName: webhook_name,
        guildName: guild_name,
        guildId: guild_id,
      },
      status: "active",
    },
  });
};

export const getDiscordConnectionUrl = async () => {
  const { user } = await validateRequest();
  if (user) {
    const connection = await db.connection.findFirst({
      where: {
        userId: Number(user.id),
        provider: "discord",
      },
    });

    if (connection) {
      const url = connection.accessToken;
      // Validate that this is actually a webhook URL, not an old OAuth token
      const isValidWebhookUrl =
        url?.startsWith("https://discord.com/api/webhooks/") ||
        url?.startsWith("https://discordapp.com/api/webhooks/");

      if (!isValidWebhookUrl) {
        console.warn(
          "Discord connection has invalid webhook URL (may be old OAuth token). User should reconnect."
        );
        return {
          url: null,
          name: (connection.metadata as any)?.webhookName,
          guildName: (connection.metadata as any)?.guildName,
          needsReconnect: true,
        };
      }

      return {
        url: connection.accessToken,
        name: (connection.metadata as any)?.webhookName,
        guildName: (connection.metadata as any)?.guildName,
        needsReconnect: false,
      };
    }
  }
  return null;
};

export const postContentToWebHook = async (content: string, url: string) => {
  if (!content) {
    return { message: "Message content is empty" };
  }

  // Validate webhook URL format
  const isValidWebhookUrl =
    url?.startsWith("https://discord.com/api/webhooks/") ||
    url?.startsWith("https://discordapp.com/api/webhooks/");

  if (!url || !isValidWebhookUrl) {
    console.error(
      "Discord Webhook Error: Invalid URL format. Expected Discord webhook URL, got:",
      url?.slice(0, 50)
    );
    return {
      message:
        "Invalid Discord webhook URL. Please reconnect Discord to get a new webhook.",
    };
  }

  try {
    const posted = await axios.post(url, { content });
    if (posted) {
      return { message: "success" };
    }
  } catch (error: any) {
    console.error("Discord Webhook Error:", error?.message || error);
    return {
      message: error?.response?.data?.message || "Failed to send message",
    };
  }

  return { message: "Unknown error" };
};
