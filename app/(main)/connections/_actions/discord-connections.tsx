"use server";

import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import {
  connectorSettingsJsonSchema,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import { getAppUser } from "@/lib/app-auth";
import axios from "axios";

export const onDiscordConnect = async (
  channel_id: string,
  webhook_id: string,
  webhook_name: string,
  webhook_url: string,
  id: string,
  guild_name: string,
  guild_id: string
) => {
  const connectorType: ConnectorType = "Discord";
  const settings = connectorSettingsJsonSchema.parse({
    channelId: channel_id,
    webhookId: webhook_id,
    webhookName: webhook_name,
    webhookURL: webhook_url,
    guildName: guild_name,
    guildId: guild_id,
  }) satisfies ConnectorSettingsInput;
  const prismaSettings = settings as Prisma.InputJsonObject;

  //check if webhook id params set
  if (webhook_id) {
    //check if webhook exists in database with userid
    const webhook = await db.discordWebhook.findFirst({
      where: {
        userId: id,
      },
      include: {
        connections: {
          select: {
            type: true,
          },
        },
      },
    });

    //if webhook does not exist for this user
    if (!webhook) {
      //create new webhook
      await db.discordWebhook.create({
        data: {
          userId: id,
          webhookId: webhook_id,
          channelId: channel_id!,
          guildId: guild_id!,
          name: webhook_name!,
          url: webhook_url!,
          guildName: guild_name!,
          connections: {
            create: {
              userId: id,
              type: connectorType,
              settings: prismaSettings,
            },
          },
        },
      });
    }

    //if webhook exists return check for duplicate
    if (webhook) {
      //check if webhook exists for target channel id
      const webhook_channel = await db.discordWebhook.findUnique({
        where: {
          channelId: channel_id,
        },
        include: {
          connections: {
            select: {
              type: true,
            },
          },
        },
      });

      //if no webhook for channel create new webhook
      if (!webhook_channel) {
        await db.discordWebhook.create({
          data: {
            userId: id,
            webhookId: webhook_id,
            channelId: channel_id!,
            guildId: guild_id!,
            name: webhook_name!,
            url: webhook_url!,
            guildName: guild_name!,
            connections: {
              create: {
                userId: id,
                type: connectorType,
                settings: prismaSettings,
              },
            },
          },
        });
      }
    }
  }
};

export const getDiscordConnectionUrl = async () => {
  const user = await getAppUser();
  if (user) {
    const webhook = await db.discordWebhook.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        url: true,
        name: true,
        guildName: true,
      },
    });

    return webhook;
  }
};

export const postContentToWebHook = async (content: string, url: string) => {
  console.log(content);
  if (content != "") {
    const posted = await axios.post(url, { content });
    if (posted) {
      return { message: "success" };
    }
    return { message: "failed request" };
  }
  return { message: "String empty" };
};

// Add this function to your existing discord-connections.ts file

export const getDiscordChannels = async () => {
  const user = await getAppUser();
  if (!user) return [];

  const connection = await db.discordWebhook.findFirst({
    where: { userId: user.id },
  });

  if (!connection) return [];

  // Since the webhook is tied to one channel, we return that as the only option
  return [
    {
      value: connection.channelId,
      label: connection.name, // The webhook name often matches the channel name
    },
  ];
};
