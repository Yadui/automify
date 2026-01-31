"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { google } from "googleapis";
import { unstable_noStore as noStore } from "next/cache";

const setupGoogleClient = async (userId: number) => {
  const connection = await db.connection.findFirst({
    where: { userId, provider: "google", status: "active" },
  });
  if (!connection) throw new Error("Google account not connected");

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth/google/callback`,
  );

  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || undefined,
  });

  // Proactive refresh if expired or near expiration
  if (
    connection.expiresAt &&
    new Date(connection.expiresAt).getTime() - Date.now() < 300000
  ) {
    try {
      await oauth2Client.getAccessToken();
    } catch (e) {
      console.error("Proactive Google refresh failed:", e);
    }
  }

  // Handle token refresh events
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await db.connection.update({
        where: { id: connection.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          expiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : undefined,
        },
      });
    }
  });

  return { oauth2Client, connection };
};

export const getFileMetaData = async () => {
  const { user } = await validateRequest();
  if (!user) return { message: "User not found" };

  try {
    const { oauth2Client } = await setupGoogleClient(Number(user.id));
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const response = await drive.files.list();
    return response.data;
  } catch (error: any) {
    console.error("Error fetching Google Drive metadata:", error);
    return { message: error.message || "Failed to fetch metadata" };
  }
};

export const getGoogleFolders = async () => {
  const { user } = await validateRequest();
  if (!user) return { message: "User not found", folders: [] };

  try {
    const { oauth2Client } = await setupGoogleClient(Number(user.id));
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const response = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: "files(id, name)",
      pageSize: 100,
    });
    return { folders: response.data.files || [], message: null };
  } catch (error: any) {
    console.error("Error fetching Google Drive folders:", error);
    return { folders: [], message: error.message || "Failed to fetch folders" };
  }
};

export const getGoogleFiles = async () => {
  const { user } = await validateRequest();
  if (!user) return { message: "User not found", files: [] };

  try {
    const { oauth2Client } = await setupGoogleClient(Number(user.id));
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const response = await drive.files.list({
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
      fields: "files(id, name, mimeType, modifiedTime)",
      pageSize: 50,
      orderBy: "modifiedTime desc",
    });
    return { files: response.data.files || [], message: null };
  } catch (error: any) {
    console.error("Error fetching Google Drive files:", error);
    return { files: [], message: error.message || "Failed to fetch files" };
  }
};

export const createGoogleFolder = async (folderName: string) => {
  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };

  try {
    const { oauth2Client } = await setupGoogleClient(Number(user.id));
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id, name",
    });
    return {
      success: true,
      folder: { id: response.data.id, name: response.data.name },
    };
  } catch (error: any) {
    console.error("Error creating Google Drive folder:", error);
    return { error: error.message || "Failed to create folder" };
  }
};

export const testGoogleDriveStep = async (
  event: "new_file" | "file_updated" | "new_folder",
  config: any,
  afterTimestamp?: string,
) => {
  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };

  try {
    const { oauth2Client } = await setupGoogleClient(Number(user.id));
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    let q = "";
    if (event === "new_file") {
      q = `'${config.folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
    } else if (event === "file_updated") {
      // For testing, just fetch the specific file
      const res = await drive.files.get({
        fileId: config.fileId,
        fields:
          "id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents",
      });
      return { success: true, data: res.data };
    } else if (event === "new_folder") {
      q = `'${config.parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    }

    console.log("[GDrive Test] Query:", q);

    const response = await drive.files.list({
      q,
      pageSize: 10,
      orderBy: "createdTime desc",
      fields:
        "files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents)",
    });

    const files = response.data.files || [];
    console.log(
      "[GDrive Test] Files found:",
      files.length,
      files.map((f) => f.name),
    );

    // If knownFileIds is provided, look for files NOT in that list
    if (afterTimestamp && config.knownFileIds) {
      const knownIds = new Set(config.knownFileIds);
      const newFiles = files.filter((f) => f.id && !knownIds.has(f.id));
      console.log(
        "[GDrive Test] New files (not in known list):",
        newFiles.length,
      );

      if (newFiles.length > 0) {
        return { success: true, data: newFiles[0] };
      }
      // Still waiting for new file
      return {
        waiting: true,
        message: "Waiting for new file...",
        currentFileIds: files.map((f) => f.id),
        filesFound: files.length,
      };
    }

    // Initial call - return current files and their IDs for tracking
    if (files.length > 0) {
      return {
        success: true,
        data: files[0],
        hasExisting: true,
        currentFileIds: files.map((f) => f.id),
      };
    }

    // No files yet - return waiting state with empty file list
    return {
      waiting: true,
      message: "No files found in this folder yet.",
      currentFileIds: [],
      filesFound: 0,
    };
  } catch (error: any) {
    console.error("[GDrive Test] Error:", error);
    return { error: error.message || "Failed to test step" };
  }
};
export const getGoogleConnection = async () => {
  noStore();
  const { user } = await validateRequest();
  if (!user) return null;

  let connection = await db.connection.findFirst({
    where: {
      userId: Number(user.id),
      provider: "google",
      status: "active",
    },
  });

  if (!connection) return null;

  // Self-healing: If email is missing in metadata, fetch it and update DB
  const metadata = (connection.metadata as any) || {};
  if (!metadata.email) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BASE_URL}/api/oauth/google/callback`,
      );

      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken || undefined,
      });

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      if (userInfo.data.email) {
        connection = await db.connection.update({
          where: { id: connection.id },
          data: {
            metadata: {
              ...metadata,
              email: userInfo.data.email,
              name: userInfo.data.name,
              picture: userInfo.data.picture,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching Google user info for metadata:", error);
      // Fallback: don't block return, just log logic failure
    }
  }

  return connection;
};
