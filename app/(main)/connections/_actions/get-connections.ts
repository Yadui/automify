"use server";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";
import {
  ACTIVE_CONNECTION_TYPES,
  getConnector,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";

export const getAllConnections = async () => {
  const user = await getAppUser();
  const emptyConnections = {
    discord: {},
    notion: {},
    slack: {},
    google: {},
    byType: {} as Partial<Record<ConnectorType, unknown>>,
    registry: ACTIVE_CONNECTION_TYPES,
  };
  if (!user) return emptyConnections;

  // Fetch all connections for the current user in parallel
  const [discord, notion, slack, google] = await Promise.all([
    db.discordWebhook.findFirst({ where: { userId: user.id } }),
    db.notion.findFirst({ where: { userId: user.id } }),
    db.slack.findFirst({ where: { userId: user.id } }),
    db.google.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { User: { email: user.email } },
        ],
      },
    }),
  ]);

  const connectionOwnerIds = Array.from(new Set([user.id, google?.userId].filter(Boolean) as string[]));
  const connectionRecords = await db.connections.findMany({
    where: { userId: { in: connectionOwnerIds }, type: { in: [...ACTIVE_CONNECTION_TYPES] } },
    select: { type: true, settings: true, relations: true, nodeId: true, workflowId: true, defaultAction: true },
  });

  const byType = connectionRecords.reduce((acc, connection) => {
    acc[connection.type as ConnectorType] = connection;
    return acc;
  }, {} as Partial<Record<ConnectorType, (typeof connectionRecords)[number]>>);

  const googleSettings = (byType["Google Drive"]?.settings ?? {}) as ConnectorSettingsInput;
  const googleScopeText =
    typeof googleSettings.scope === "string"
      ? googleSettings.scope
      : typeof googleSettings.scopes === "string"
      ? googleSettings.scopes
      : Array.isArray(googleSettings.scopes)
      ? googleSettings.scopes.join(" ")
      : "";
  const hasGoogleCredential = Boolean(googleSettings.accessToken || google?.accessToken);

  ACTIVE_CONNECTION_TYPES.forEach((type) => {
    const connector = getConnector(type);
    if (!connector.sharedCredentialType || byType[type]) return;

    const missingScopes = (connector.requiredCredentialScopes ?? []).filter(
      (scope) => !googleScopeText.includes(scope)
    );

    if (hasGoogleCredential && missingScopes.length === 0) {
      const sharedConnection = byType[connector.sharedCredentialType];
      if (!sharedConnection) return;
      byType[type] = {
        ...sharedConnection,
        type,
      };
    }
  });

  const googleWithSettings = google
    ? {
        ...google,
        settings: googleSettings,
        scope: googleSettings.scope,
        scopes: googleSettings.scopes,
      }
    : {};

  // Return the data in a structured way
  return {
    discord: discord || {},
    notion: notion || {},
    slack: slack || {},
    google: googleWithSettings,
    byType,
    registry: ACTIVE_CONNECTION_TYPES,
  };
};
