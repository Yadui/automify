import { CONNECTIONS } from "@/lib/constant";
import React from "react";
import ConnectionCard from "./_components/connection-card";
import { currentUser } from "@clerk/nextjs/server";
import { onDiscordConnect } from "./_actions/discord-connections";
import { onNotionConnect } from "./_actions/notion-connection";
import { onSlackConnect } from "./_actions/slack-connection";
import { getUserData } from "./_actions/get-user";

// Define specific types for the props
interface ConnectionProps {
  webhook_id?: string;
  webhook_name?: string;
  webhook_url?: string;
  guild_id?: string;
  guild_name?: string;
  channel_id?: string;
  access_token?: string;
  workspace_name?: string;
  workspace_icon?: string;
  workspace_id?: string;
  database_id?: string;
  app_id?: string;
  authed_user_id?: string;
  authed_user_token?: string;
  slack_access_token?: string;
  bot_user_id?: string;
  team_id?: string;
  team_name?: string;
}

interface ConnectionStatus {
  [key: string]: boolean; // This allows any string key with a boolean value
}

const Connections = async (props: ConnectionProps) => {
  const {
    webhook_id,
    webhook_name,
    webhook_url,
    guild_id,
    guild_name,
    channel_id,
    access_token,
    workspace_name,
    workspace_icon,
    workspace_id,
    database_id,
    app_id,
    authed_user_id,
    authed_user_token,
    slack_access_token,
    bot_user_id,
    team_id,
    team_name,
  } = props;

  const user = await currentUser();
  if (!user) return null;

  const onUserConnections = async () => {
    await onDiscordConnect(
      channel_id!,
      webhook_id!,
      webhook_name!,
      webhook_url!,
      user.id,
      guild_name!,
      guild_id!
    );
    await onNotionConnect(
      access_token!,
      workspace_id!,
      workspace_icon!,
      workspace_name!,
      database_id!,
      user.id
    );

    await onSlackConnect(
      app_id!,
      authed_user_id!,
      authed_user_token!,
      slack_access_token!,
      bot_user_id!,
      team_id!,
      team_name!,
      user.id
    );

    const connections: ConnectionStatus = {
      Notion: false,
      Slack: false,
      "Google Drive": true, // Always true as per logic
      Discord: false,
    };

    const user_info = await getUserData(user.id);

    user_info?.connections.forEach((connection: { type: string }) => {
      if (connection.type in connections) {
        connections[connection.type as keyof ConnectionStatus] = true;
      }
    });

    return connections;
  };

  const connections = await onUserConnections();

  return (
    <div className="relative flex flex-col gap-4">
      <h1 className="sticky top-0 z-[10] flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg">
        Connections
      </h1>
      <div className="relative flex flex-col gap-4">
        <section className="flex flex-col gap-4 p-6 text-muted-foreground">
          Connect all your apps directly from here. You may need to connect
          these apps regularly to refresh verification
          {CONNECTIONS.map((connection) => (
            <ConnectionCard
              key={connection.title}
              description={connection.description}
              title={connection.title}
              icon={connection.image}
              type={connection.title}
              connected={connections}
            />
          ))}
        </section>
      </div>
    </div>
  );
};

export default Connections;
