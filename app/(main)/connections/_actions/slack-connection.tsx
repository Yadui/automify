"use server";
import { Option } from "@/components/ui/multiple-select";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import axios from "axios";

export const onSlackConnect = async (
  app_id: string,
  authed_user_id: string,
  authed_user_token: string,
  slack_access_token: string,
  bot_user_id: string,
  team_id: string,
  team_name: string,
  userId: number
): Promise<void> => {
  if (!slack_access_token) return;

  await db.connection.upsert({
    where: {
      userId_provider_providerAccountId: {
        userId,
        provider: "slack",
        providerAccountId: team_id,
      },
    },
    update: {
      accessToken: slack_access_token,
      metadata: {
        appId: app_id,
        authedUserId: authed_user_id,
        authedUserToken: authed_user_token,
        botUserId: bot_user_id,
        teamName: team_name,
      },
      status: "active",
    },
    create: {
      userId,
      provider: "slack",
      providerAccountId: team_id,
      accessToken: slack_access_token,
      metadata: {
        appId: app_id,
        authedUserId: authed_user_id,
        authedUserToken: authed_user_token,
        botUserId: bot_user_id,
        teamName: team_name,
      },
      status: "active",
    },
  });
};

export const getSlackConnection = async () => {
  const { user } = await validateRequest();
  if (user) {
    return await db.connection.findFirst({
      where: {
        userId: Number(user.id),
        provider: "slack",
      },
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

    if (!data.ok) throw new Error(data.error);
    if (!data?.channels?.length) return [];

    return data.channels
      .filter((ch) => ch.is_member)
      .map((ch) => ({
        label: ch.name,
        value: ch.id,
      }));
  } catch (error) {
    console.error("Error listing bot channels:", error);
    throw error;
  }
}

const postMessageInSlackChannel = async (
  slackAccessToken: string,
  slackChannel: string,
  content: string
): Promise<void> => {
  try {
    await axios.post(
      "https://slack.com/api/chat.postMessage",
      { channel: slackChannel, text: content },
      {
        headers: {
          Authorization: `Bearer ${slackAccessToken}`,
          "Content-Type": "application/json;charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error(
      `Error posting message to Slack channel ${slackChannel}:`,
      error
    );
  }
};

export const postMessageToSlack = async (
  slackAccessToken: string,
  selectedSlackChannels: Option[],
  content: string
): Promise<{ message: string }> => {
  if (!content) return { message: "Content is empty" };
  if (!selectedSlackChannels?.length)
    return { message: "Channel not selected" };

  try {
    const promises = selectedSlackChannels
      .map((channel) => channel?.value)
      .filter((val): val is string => !!val)
      .map((channelId) =>
        postMessageInSlackChannel(slackAccessToken, channelId, content)
      );

    await Promise.all(promises);
    return { message: "Success" };
  } catch (error) {
    console.error("Error posting message to Slack channel:", error);
    return { message: "Failed to post messages" };
  }
};
