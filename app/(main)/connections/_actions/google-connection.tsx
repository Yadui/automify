"use server";
import type { Prisma } from "@prisma/client";
import { google } from "googleapis";
import db from "@/lib/db";
import {
  connectorSettingsJsonSchema,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthProviderCredentials } from "@/lib/oauth-provider-config";

const FOLDER_MIME = "application/vnd.google-apps.folder";

// Builds an authenticated Google OAuth2 client for the current user, or null.
const getGoogleAuthClient = async () => {
  const user = await getAppUser();
  if (!user) return null;

  const googleConnection = await db.google.findFirst({
    where: {
      OR: [{ userId: user.id }, { User: { email: user.email } }],
    },
  });
  if (!googleConnection?.accessToken) return null;

  const credentials = getOAuthProviderCredentials("google");
  if (!credentials) return null;

  const oauth2Client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    process.env.OAUTH2_REDIRECT_URI ||
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: googleConnection.accessToken,
    refresh_token: googleConnection.refreshToken || undefined,
  });

  return oauth2Client;
};

const toRecoverableMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("invalid_grant")) {
    return "Google connection expired. Reconnect Google Drive from Connections.";
  }
  if (message.includes("insufficient") || message.includes("invalid_scope")) {
    return "This connection needs additional permissions. Reconnect it from Connections.";
  }
  return null;
};

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

// Returns minimal info about the connected Google account (or null).
export const getGoogleConnection = async () => {
  const auth = await getGoogleAuthClient();
  const user = await getAppUser();
  if (!auth) return null;

  let email = user?.email ?? "";
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const profile = await gmail.users.getProfile({ userId: "me" });
    if (profile.data.emailAddress) email = profile.data.emailAddress;
  } catch {
    // Gmail scope may be unavailable; fall back to the app account email.
  }

  return { metadata: { email } };
};

// Lists Drive folders accessible to this app.
export const getGoogleFolders = async (): Promise<{
  folders?: { id: string; name: string }[];
  message?: string;
}> => {
  const auth = await getGoogleAuthClient();
  if (!auth) return { message: "Google Drive is not connected." };

  try {
    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.list({
      q: `mimeType='${FOLDER_MIME}' and trashed=false`,
      fields: "files(id,name)",
      orderBy: "name",
      pageSize: 100,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });
    const folders = (response.data.files ?? []).flatMap((file) =>
      file.id ? [{ id: file.id, name: file.name ?? "Untitled Folder" }] : []
    );
    return { folders };
  } catch (error) {
    const recoverable = toRecoverableMessage(error);
    return { folders: [], message: recoverable ?? "Unable to load folders." };
  }
};

// Lists Drive files (non-folders) accessible to this app.
export const getGoogleFiles = async (): Promise<{
  files?: { id: string; name: string; mimeType?: string }[];
  message?: string;
}> => {
  const auth = await getGoogleAuthClient();
  if (!auth) return { message: "Google Drive is not connected." };

  try {
    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.list({
      q: `mimeType!='${FOLDER_MIME}' and trashed=false`,
      fields: "files(id,name,mimeType)",
      orderBy: "name",
      pageSize: 100,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });
    const files = (response.data.files ?? []).flatMap((file) =>
      file.id
        ? [
            {
              id: file.id,
              name: file.name ?? "Untitled File",
              mimeType: file.mimeType ?? undefined,
            },
          ]
        : []
    );
    return { files };
  } catch (error) {
    const recoverable = toRecoverableMessage(error);
    return { files: [], message: recoverable ?? "Unable to load files." };
  }
};

// Creates a new folder in Drive (root) and returns it.
export const createGoogleFolder = async (
  name: string
): Promise<{
  success: boolean;
  folder?: { id: string; name: string };
  error?: string;
}> => {
  const auth = await getGoogleAuthClient();
  if (!auth) return { success: false, error: "Google Drive is not connected." };

  try {
    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.create({
      requestBody: { name, mimeType: FOLDER_MIME },
      fields: "id,name",
      supportsAllDrives: true,
    });
    if (!response.data.id) {
      return { success: false, error: "Folder creation returned no id." };
    }
    return {
      success: true,
      folder: { id: response.data.id, name: response.data.name ?? name },
    };
  } catch (error) {
    const recoverable = toRecoverableMessage(error);
    return {
      success: false,
      error: recoverable ?? "Failed to create folder.",
    };
  }
};

type DriveStepConfig = {
  event?: string;
  folderId?: string;
  parentId?: string;
  fileId?: string;
  knownFileIds?: string[];
  [key: string]: unknown;
};

type DriveStepResult = {
  success?: boolean;
  data?: Record<string, unknown>;
  error?: string;
  currentFileIds?: string[];
};

// Tests / polls a Google Drive trigger step.
// - file_updated: fetches the configured file.
// - new_file / new_folder: returns currentFileIds (no knownFileIds), or
//   detects a newly-added item when knownFileIds is supplied.
export const testGoogleDriveStep = async (
  event: string,
  config: DriveStepConfig,
  _startTime?: string
): Promise<DriveStepResult> => {
  const auth = await getGoogleAuthClient();
  if (!auth) return { success: false, error: "Google Drive is not connected." };

  const drive = google.drive({ version: "v3", auth });
  const fileFields = "id,name,mimeType,createdTime,modifiedTime,webViewLink";

  try {
    if (event === "file_updated") {
      if (!config.fileId) {
        return { success: false, error: "No file selected." };
      }
      const response = await drive.files.get({
        fileId: config.fileId,
        fields: fileFields,
        supportsAllDrives: true,
      });
      return { success: true, data: response.data as Record<string, unknown> };
    }

    // new_file watches files inside folderId; new_folder watches folders inside parentId.
    const parentId =
      event === "new_folder" ? config.parentId : config.folderId;
    if (!parentId) {
      return { success: false, error: "No folder selected." };
    }

    const mimeClause =
      event === "new_folder"
        ? `mimeType='${FOLDER_MIME}'`
        : `mimeType!='${FOLDER_MIME}'`;

    const response = await drive.files.list({
      q: `'${parentId}' in parents and ${mimeClause} and trashed=false`,
      fields: "files(id,name,mimeType,createdTime,modifiedTime,webViewLink)",
      orderBy: "createdTime desc",
      pageSize: 100,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    const items = response.data.files ?? [];

    // Initial call: report current ids so the poller can detect new ones.
    if (!config.knownFileIds) {
      return {
        currentFileIds: items.flatMap((item) => (item.id ? [item.id] : [])),
      };
    }

    // Poll call: find an item not present in the known set.
    const known = new Set(config.knownFileIds);
    const newItem = items.find((item) => item.id && !known.has(item.id));
    if (newItem) {
      return { success: true, data: newItem as Record<string, unknown> };
    }

    // Nothing new yet — keep polling.
    return { success: false };
  } catch (error) {
    const recoverable = toRecoverableMessage(error);
    return { success: false, error: recoverable ?? "Drive test failed." };
  }
};
