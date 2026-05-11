import {
  ACTIVE_CONNECTION_TYPES,
  getConnector,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import React from "react";
import ConnectionCard from "./_components/connection-card";
import { onDiscordConnect } from "./_actions/discord-connections";
import { onNotionConnect } from "./_actions/notion-connection";
import { onSlackConnect } from "./_actions/slack-connection";
import { getUserData } from "./_actions/get-user";
import { getAppUser } from "@/lib/app-auth";

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

type ConnectionsPageProps = {
  searchParams?: Promise<ConnectionProps>;
};

const Connections = async ({ searchParams }: ConnectionsPageProps) => {
  const props = (await searchParams) ?? {};
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

  const user = await getAppUser();
  if (!user) return null;

  const onUserConnections = async () => {
    if (channel_id && webhook_id && webhook_name && webhook_url && guild_name && guild_id) {
      await onDiscordConnect(
        channel_id,
        webhook_id,
        webhook_name,
        webhook_url,
        user.id,
        guild_name,
        guild_id
      );
    }

    if (access_token && workspace_id && workspace_icon && workspace_name && database_id) {
      await onNotionConnect(
        access_token,
        workspace_id,
        workspace_icon,
        workspace_name,
        database_id,
        user.id
      );
    }

    if (app_id && authed_user_id && slack_access_token && bot_user_id && team_id && team_name) {
      await onSlackConnect(
        app_id,
        authed_user_id,
        authed_user_token ?? "",
        slack_access_token,
        bot_user_id,
        team_id,
        team_name,
        user.id
      );
    }

    const connections = ACTIVE_CONNECTION_TYPES.reduce((acc, type) => {
      acc[type] = false;
      return acc;
    }, {} as Record<ConnectorType, boolean>);

    const user_info = await getUserData(user.id);

    user_info?.connections.forEach((connection: { type: string; settings?: unknown }) => {
      if (connection.type in connections) {
        connections[connection.type as ConnectorType] = true;
      }
    });

    const googleConnection = user_info?.connections.find(
      (connection: { type: string }) => connection.type === "Google Drive"
    );
    const googleSettings = (googleConnection?.settings ?? {}) as ConnectorSettingsInput;
    const googleScopeText =
      typeof googleSettings.scope === "string"
        ? googleSettings.scope
        : Array.isArray(googleSettings.scopes)
        ? googleSettings.scopes.join(" ")
        : "";

    ACTIVE_CONNECTION_TYPES.forEach((type) => {
      const connector = getConnector(type);
      if (!connector.sharedCredentialType || connections[type]) return;
      const missingScopes = (connector.requiredCredentialScopes ?? []).filter(
        (scope) => !googleScopeText.includes(scope)
      );
      connections[type] = Boolean(
        connections[connector.sharedCredentialType] && missingScopes.length === 0
      );
    });

    return connections;
  };

  const connections = await onUserConnections();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">OAuth and credentials</p>
          <h1 className="ds-page-title mt-3">Connections</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Connect apps directly from here and refresh verification when scopes or tokens change.
          </p>
        </div>
      </header>
      <div className="relative flex flex-col gap-4">
        <section className="flex flex-col gap-4">
          {ACTIVE_CONNECTION_TYPES.map((type) => {
            const connector = getConnector(type);
            return (
              <ConnectionCard
                key={connector.type}
                description={connector.description}
                title={connector.title}
                type={connector.type}
                connected={connections}
              />
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default Connections;
