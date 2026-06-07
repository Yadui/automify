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

  // redirect_uri here is only used for auth-code exchange, not for API calls
  // or token refresh — so it just needs to be a valid registered URI.
  const redirectUri =
    process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      : process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
        process.env.OAUTH2_REDIRECT_URI;

  const oauth2Client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    access_token: googleConnection.accessToken,
    refresh_token: googleConnection.refreshToken || undefined,
    token_type: "Bearer",
  });

  return oauth2Client;
};

// Extracts the real error message buried inside a GaxiosError response body.
// googleapis wraps API errors in GaxiosError; error.message is just
// "Request failed with status code 4xx" — the human-readable reason is in
// error.response.data.error.
const extractGoogleErrorMessage = (error: unknown): string => {
  const gaxData = (error as { response?: { data?: { error?: { message?: string; errors?: { message?: string; reason?: string }[] } } } })
    ?.response?.data?.error;
  return (
    gaxData?.message ||
    gaxData?.errors?.[0]?.message ||
    (error instanceof Error ? error.message : String(error))
  );
};

const extractGoogleErrorReason = (error: unknown): string => {
  const gaxData = (error as { response?: { data?: { error?: { status?: string; errors?: { reason?: string }[] } } } })
    ?.response?.data?.error;
  return gaxData?.errors?.[0]?.reason || gaxData?.status || "";
};

const toRecoverableMessage = (error: unknown) => {
  const message = extractGoogleErrorMessage(error);
  const reason = extractGoogleErrorReason(error);

  if (message.includes("invalid_grant") || reason === "invalid_grant") {
    return "Google connection expired. Reconnect from Connections.";
  }
  if (
    message.toLowerCase().includes("insufficient") ||
    reason === "insufficientPermissions" ||
    message.includes("invalid_scope")
  ) {
    return "This connection needs additional permissions. Reconnect it from Connections.";
  }
  if (
    message.includes("not been used in project") ||
    message.includes("is disabled") ||
    reason === "accessNotConfigured"
  ) {
    return "Google Calendar API is not enabled in your Google Cloud project. Go to console.cloud.google.com → APIs & Services → Enable Google Calendar API.";
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
    return { folders: [], message: recoverable ?? extractGoogleErrorMessage(error) };
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
    return { files: [], message: recoverable ?? extractGoogleErrorMessage(error) };
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
      error: recoverable ?? extractGoogleErrorMessage(error),
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

// Lists Google Calendars for the authenticated user.
export const listGoogleCalendars = async (): Promise<{
  calendars?: { id: string; summary: string }[];
  message?: string;
}> => {
  const auth = await getGoogleAuthClient();
  if (!auth) return { message: "Google Calendar is not connected." };

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.calendarList.list({ maxResults: 100 });
    const calendars = (response.data.items ?? []).flatMap((item) =>
      item.id ? [{ id: item.id, summary: item.summary ?? item.id }] : []
    );
    return { calendars };
  } catch (error) {
    const recoverable = toRecoverableMessage(error);
    return { calendars: [], message: recoverable ?? extractGoogleErrorMessage(error) };
  }
};

type CalendarStepConfig = {
  action?: string;
  calendarId?: string;
  eventId?: string;
  summary?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  attendees?: string;
  defaultReminders?: boolean;
  [key: string]: unknown;
};

type CalendarStepResult = {
  success?: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

// Executes a Google Calendar action step (create / update / delete / get event).
export const testGoogleCalendarStep = async (
  action: string,
  config: CalendarStepConfig
): Promise<CalendarStepResult> => {
  const auth = await getGoogleAuthClient();
  if (!auth) return { success: false, error: "Google Calendar is not connected." };

  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = config.calendarId || "primary";

  const parseDateTime = (raw: string) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) throw new Error(`Invalid date: "${raw}"`);
    return d.toISOString();
  };

  try {
    if (action === "create_event") {
      if (!config.summary) return { success: false, error: "Event title is required." };
      if (!config.startTime) return { success: false, error: "Start time is required." };
      if (!config.endTime) return { success: false, error: "End time is required." };

      const attendeeList = config.attendees
        ? config.attendees
            .split(",")
            .map((e) => ({ email: e.trim() }))
            .filter((a) => a.email)
        : [];

      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: config.summary,
          description: config.description || undefined,
          start: { dateTime: parseDateTime(config.startTime) },
          end: { dateTime: parseDateTime(config.endTime) },
          attendees: attendeeList.length ? attendeeList : undefined,
          reminders: config.defaultReminders
            ? { useDefault: true }
            : { useDefault: false, overrides: [] },
        },
      });
      return { success: true, data: response.data as Record<string, unknown> };
    }

    if (action === "update_event") {
      if (!config.eventId) return { success: false, error: "Event ID is required." };
      const response = await calendar.events.patch({
        calendarId,
        eventId: config.eventId,
        requestBody: {
          summary: config.summary || undefined,
          description: config.description || undefined,
          start: config.startTime ? { dateTime: parseDateTime(config.startTime) } : undefined,
          end: config.endTime ? { dateTime: parseDateTime(config.endTime) } : undefined,
        },
      });
      return { success: true, data: response.data as Record<string, unknown> };
    }

    if (action === "delete_event") {
      if (!config.eventId) return { success: false, error: "Event ID is required." };
      await calendar.events.delete({ calendarId, eventId: config.eventId });
      return { success: true, data: { deleted: true, eventId: config.eventId, calendarId } };
    }

    if (action === "get_event") {
      if (!config.eventId) return { success: false, error: "Event ID is required." };
      const response = await calendar.events.get({ calendarId, eventId: config.eventId });
      return { success: true, data: response.data as Record<string, unknown> };
    }

    return { success: false, error: `Unknown action: ${action}` };
  } catch (error) {
    const recoverable = toRecoverableMessage(error);
    const rawMessage = extractGoogleErrorMessage(error);
    return { success: false, error: recoverable ?? rawMessage ?? "Calendar action failed." };
  }
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
    return { success: false, error: recoverable ?? extractGoogleErrorMessage(error) };
  }
};
