"use server"; // Add this to mark it as a Server Component

import type { Prisma } from "@prisma/client";
import { Option } from "@/components/ui/multiple-select";
import db from "@/lib/db";
import {
  connectorSettingsJsonSchema,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import { getAppUser } from "@/lib/app-auth";
import axios from "axios";
// import { SomeType } from "@/lib/types"; // Import necessary types

// Define a specific type for the function parameters instead of using any
// If you need to keep it, add a comment explaining why it's kept
// interface SlackConnectParams {}

// Update the function to use the defined type
export const onSlackConnect = async (
  app_id: string,
  authed_user_id: string,
  authed_user_token: string,
  slack_access_token: string,
  bot_user_id: string,
  team_id: string,
  team_name: string,
  user_id: string
): Promise<void> => {
  const connectorType: ConnectorType = "Slack";
  const settings = connectorSettingsJsonSchema.parse({
    appId: app_id,
    authedUserId: authed_user_id,
    authedUserToken: authed_user_token,
    slackAccessToken: slack_access_token,
    botUserId: bot_user_id,
    teamId: team_id,
    teamName: team_name,
  }) satisfies ConnectorSettingsInput;
  const prismaSettings = settings as Prisma.InputJsonObject;

  if (!slack_access_token) return;

  const slackConnection = await db.slack.findFirst({
    where: { slackAccessToken: slack_access_token },
    include: { connections: true },
  });

  if (!slackConnection) {
    await db.slack.create({
      data: {
        userId: user_id,
        appId: app_id,
        authedUserId: authed_user_id,
        authedUserToken: authed_user_token,
        slackAccessToken: slack_access_token,
        botUserId: bot_user_id,
        teamId: team_id,
        teamName: team_name,
        connections: {
          create: { userId: user_id, type: connectorType, settings: prismaSettings },
        },
      },
    });
  } else {
    await db.connections.upsert({
      where: {
        userId_type: {
          userId: user_id,
          type: connectorType,
        },
      },
      create: {
        userId: user_id,
        type: connectorType,
        slackId: slackConnection.id,
        settings: prismaSettings,
      },
      update: { settings: prismaSettings, slackId: slackConnection.id },
    });
  }
};

export const getSlackConnection = async () => {
  const user = await getAppUser();
  if (user) {
    return await db.slack.findFirst({
      where: { userId: user.id },
    });
  }
  return null;
};

export async function listBotChannels(
  slackAccessToken: string
): Promise<Option[]> {
  const url = `https://slack.com/api/conversations.list?${new URLSearchParams({
    types: "public_channel,private_channel",
    limit: "200",
  })}`;

  try {
    const { data } = await axios.get<{
      ok: boolean;
      channels: { name: string; id: string; is_member: boolean }[];
      error?: string;
    }>(url, {
      headers: { Authorization: `Bearer ${slackAccessToken}` },
    });

    console.log(data);

    if (!data.ok) throw new Error(data.error);

    if (!data?.channels?.length) return [];

    return data.channels
      .filter((ch) => ch.is_member)
      .map((ch) => ({
        label: ch.name,
        value: ch.id,
      }));
  } catch (error) {
    console.error("Error listing bot channels:");
    throw error;
  }
}

const postMessageInSlackChannel = async (
  slackAccessToken: string,
  slackChannel: string,
  content: string
): Promise<{ channel: string; ts: string } | null> => {
  try {
    const { data } = await axios.post<{ ok: boolean; ts?: string; channel?: string; error?: string }>(
      "https://slack.com/api/chat.postMessage",
      { channel: slackChannel, text: content },
      {
        headers: {
          Authorization: `Bearer ${slackAccessToken}`,
          "Content-Type": "application/json;charset=utf-8",
        },
      }
    );
    console.log(`Message posted successfully to channel ID: ${slackChannel}`);
    if (data.ok && data.ts && data.channel) {
      return { channel: data.channel, ts: data.ts };
    }
    return null;
  } catch (error) {
    console.error(
      `Error posting message to Slack channel ${slackChannel}:`,
      error
    );
    return null;
  }
};

// Wrapper function to post messages to multiple Slack channels
export const postMessageToSlack = async (
  slackAccessToken: string,
  selectedSlackChannels: Option[],
  content: string
): Promise<{ message: string; sentItems?: { channel: string; ts: string }[] }> => {
  if (!content) return { message: "Content is empty" };
  if (!selectedSlackChannels?.length)
    return { message: "Channel not selected" };

  try {
    const results = await Promise.all(
      selectedSlackChannels
        .map((channel) => channel?.value)
        .map((channel) => postMessageInSlackChannel(slackAccessToken, channel, content))
    );
    const sentItems = results.filter((r): r is { channel: string; ts: string } => r !== null);
    return { message: "Success", sentItems };
  } catch (error) {
    console.error("Error posting message to Slack channel:", error);
    return { message: "Success" };
  }
};

// Deletes messages that were created during a test run using their channel + ts identifiers.
// The bot can only delete messages it posted (requires chat:write scope).
export const deleteSlackTestMessages = async (
  slackAccessToken: string,
  items: { channel: string; ts: string }[]
): Promise<{ ok: boolean; error?: string }> => {
  if (!slackAccessToken || !items.length) return { ok: false, error: "Nothing to delete" };
  try {
    await Promise.all(
      items.map(({ channel, ts }) =>
        axios.post(
          "https://slack.com/api/chat.delete",
          { channel, ts },
          {
            headers: {
              Authorization: `Bearer ${slackAccessToken}`,
              "Content-Type": "application/json;charset=utf-8",
            },
          }
        )
      )
    );
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to delete messages" };
  }
};
