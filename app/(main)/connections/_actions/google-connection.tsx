"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { google } from "googleapis";

export const getFileMetaData = async () => {
  const { user } = await validateRequest();

  if (!user) {
    return { message: "User not found" };
  }

  // Fetch the first active Google connection for the user
  const connection = await db.connection.findFirst({
    where: {
      userId: Number(user.id),
      provider: "google",
      status: "active",
    },
  });

  if (!connection) {
    return { message: "Google account not connected" };
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || undefined,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const response = await drive.files.list();
    return response.data;
  } catch (error) {
    console.error("Error fetching Google Drive metadata:", error);
    return { message: "Failed to fetch metadata" };
  }
};

export const getGoogleFolders = async () => {
  const { user } = await validateRequest();
  if (!user) return { message: "User not found", folders: [] };

  const connection = await db.connection.findFirst({
    where: { userId: Number(user.id), provider: "google", status: "active" },
  });
  if (!connection)
    return { message: "Google account not connected", folders: [] };

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth/google/callback`
  );
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || undefined,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    // Note: With drive.file scope, this only returns folders created by or opened with this app
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

  const connection = await db.connection.findFirst({
    where: { userId: Number(user.id), provider: "google", status: "active" },
  });
  if (!connection)
    return { message: "Google account not connected", files: [] };

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth/google/callback`
  );
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || undefined,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    // Note: With drive.file scope, this only returns files created by or opened with this app
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

  const connection = await db.connection.findFirst({
    where: { userId: Number(user.id), provider: "google", status: "active" },
  });
  if (!connection) return { error: "Google account not connected" };

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth/google/callback`
  );
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || undefined,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
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
  afterTimestamp?: string
) => {
  const { user } = await validateRequest();
  if (!user) return { error: "User not found" };

  const connection = await db.connection.findFirst({
    where: { userId: Number(user.id), provider: "google", status: "active" },
  });
  if (!connection) return { error: "Google account not connected" };

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth/google/callback`
  );
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken || undefined,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
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
      files.map((f) => f.name)
    );

    // If knownFileIds is provided, look for files NOT in that list
    if (afterTimestamp && config.knownFileIds) {
      const knownIds = new Set(config.knownFileIds);
      const newFiles = files.filter((f) => f.id && !knownIds.has(f.id));
      console.log(
        "[GDrive Test] New files (not in known list):",
        newFiles.length
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
  const { user } = await validateRequest();
  if (!user) return null;

  return await db.connection.findFirst({
    where: {
      userId: Number(user.id),
      provider: "google",
      status: "active",
    },
  });
};
