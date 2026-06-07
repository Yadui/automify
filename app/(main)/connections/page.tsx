import {
  ACTIVE_CONNECTION_TYPES,
  getConnector,
  isConnectorType,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import React, { Suspense } from "react";
import ConnectionCard from "./_components/connection-card";
import { ManualConnectionForm } from "./_components/manual-connection-form";
import { onDiscordConnect } from "./_actions/discord-connections";
import { onNotionConnect } from "./_actions/notion-connection";
import { onSlackConnect } from "./_actions/slack-connection";
import { getUserData } from "./_actions/get-user";
import { getAppUser } from "@/lib/app-auth";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  // PAT (manual) connection flow
  manualConnector?: string;
  returnTo?: string;
  connectionSaved?: string;
  connectionError?: string;
}

type ConnectionsPageProps = {
  searchParams?: Promise<ConnectionProps>;
};

// ─── OAuth callback handler (fast — only writes if params are present) ────────

async function handleOAuthCallbacks(userId: string, props: ConnectionProps) {
  const {
    channel_id,
    webhook_id,
    webhook_name,
    webhook_url,
    guild_id,
    guild_name,
    access_token,
    workspace_id,
    workspace_icon,
    workspace_name,
    database_id,
    app_id,
    authed_user_id,
    authed_user_token,
    slack_access_token,
    bot_user_id,
    team_id,
    team_name,
  } = props;

  if (channel_id && webhook_id && webhook_name && webhook_url && guild_name && guild_id) {
    await onDiscordConnect(
      channel_id,
      webhook_id,
      webhook_name,
      webhook_url,
      userId,
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
      userId
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
      userId
    );
  }
}

// ─── Async server component — deferred via Suspense ──────────────────────────

async function ConnectionsList({ userId }: { userId: string }) {
  const connections = ACTIVE_CONNECTION_TYPES.reduce((acc, type) => {
    acc[type] = false;
    return acc;
  }, {} as Record<ConnectorType, boolean>);

  const user_info = await getUserData(userId);

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

  return (
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
  );
}

// ─── Skeleton shown while ConnectionsList is resolving ────────────────────────

function ConnectionsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex w-full items-center justify-between p-4 rounded-lg border border-[#ebebeb]"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Connections = async ({ searchParams }: ConnectionsPageProps) => {
  const props = (await searchParams) ?? {};
  const user = await getAppUser();
  if (!user) return null;

  // Handle any inbound OAuth redirect params (no-op when params are absent).
  await handleOAuthCallbacks(user.id, props);

  // PAT (manual) connector form state
  const manualType =
    props.manualConnector && isConnectorType(props.manualConnector)
      ? props.manualConnector
      : null;
  const returnTo = props.returnTo;
  const connectionSaved =
    props.connectionSaved && isConnectorType(props.connectionSaved)
      ? props.connectionSaved
      : null;
  const connectionError = props.connectionError ?? null;

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

      {/* Success banner — shown after saveManualConnection redirects back */}
      {connectionSaved && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <strong>{getConnector(connectionSaved).title}</strong> connected successfully.
        </div>
      )}

      {/* PAT connection form — shown when manualConnector param is present */}
      {manualType && (
        <ManualConnectionForm
          type={manualType}
          returnTo={returnTo}
          isUpdate={false}
          errorCode={connectionError ?? undefined}
        />
      )}

      <div className="relative flex flex-col gap-4">
        {/*
         * ConnectionsList fetches from the DB and is deferred via Suspense so
         * the page header above renders immediately while the cards stream in.
         */}
        <Suspense fallback={<ConnectionsListSkeleton />}>
          <ConnectionsList userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
};

export default Connections;
