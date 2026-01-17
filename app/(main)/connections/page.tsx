import { CONNECTIONS } from "@/lib/constant";
import React from "react";
import ConnectionCard from "./_components/connection-card";
import { validateRequest } from "@/lib/auth";
import { onDiscordConnect } from "./_actions/discord-connections";
import { onNotionConnect } from "./_actions/notion-connection";
import { onSlackConnect } from "./_actions/slack-connection";
import { getUserData } from "./_actions/get-user";
import PageHeader from "@/components/page-header";

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

  const { user } = await validateRequest();
  if (!user) return null;

  const onUserConnections = async () => {
    /*
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
    */

    const connections: ConnectionStatus = {
      Notion: false,
      Slack: false,
      "Google Drive": false,
      Discord: false,
      GitHub: false,
    };

    const user_info = await getUserData(Number(user.id));

    user_info?.connections.forEach((connection) => {
      if (connection.provider === "google") connections["Google Drive"] = true;
      if (connection.provider === "slack") connections["Slack"] = true;
      if (connection.provider === "notion") connections["Notion"] = true;
      if (connection.provider === "discord") connections["Discord"] = true;
      if (connection.provider === "github") connections["GitHub"] = true;
    });

    return connections;
  };

  const connections = await onUserConnections();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Connections"
        description="Connect all your apps directly from here. You may need to reconnect to refresh verification."
      />
      <div className="flex-1 p-6">
        <div className="grid gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default Connections;
