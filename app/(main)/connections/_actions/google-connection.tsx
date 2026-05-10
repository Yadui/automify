"use server";
import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import {
  connectorSettingsJsonSchema,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";

export const onGoogleDriveConnect = async (
  access_token: string,
  refresh_token: string | undefined,
  userId: string,
  scope?: string
) => {
  const connectorType: ConnectorType = "Google Drive";

  if (!access_token) {
    throw new Error("Google access token is missing.");
  }

  // Check if a connection for this user already exists
  const existingConnection = await db.google.findFirst({
    where: { userId },
  });

  const settings = connectorSettingsJsonSchema.parse({
    accessToken: access_token,
    refreshToken: refresh_token ?? existingConnection?.refreshToken ?? "",
    scope: scope ?? "",
  }) satisfies ConnectorSettingsInput;
  const prismaSettings = settings as Prisma.InputJsonObject;

  if (existingConnection) {
    // If it exists, update the tokens
    await db.google.update({
      where: { userId },
      data: {
        accessToken: access_token,
        refreshToken: refresh_token ?? existingConnection.refreshToken,
        Connections: {
          upsert: {
            where: {
              userId_type: {
                userId,
                type: connectorType,
              },
            },
            create: { userId, type: connectorType, settings: prismaSettings },
            update: { settings: prismaSettings },
          },
        },
      },
    });
  } else {
    // If it's a new connection, create the record and the link in the Connections table
    await db.google.create({
      data: {
        userId,
        accessToken: access_token,
        refreshToken: refresh_token ?? "",
        Connections: {
          create: {
            userId,
            type: connectorType,
            settings: prismaSettings,
          },
        },
      },
    });
  }
};
