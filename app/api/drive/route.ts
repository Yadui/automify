import { google } from "googleapis";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthProviderCredentials } from "@/lib/oauth-provider-config";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getGoogleDriveConnectionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  const status = isRecord(error) ? error.status ?? error.code : undefined;

  if (message.includes("invalid_grant")) {
    return "Google Drive connection expired. Reconnect Google Drive.";
  }

  if (message.includes("insufficient") || message.includes("invalid_scope")) {
    return "Google Drive needs additional permissions. Reconnect Google Drive.";
  }

  if (status === 401 || status === 403) {
    return "Google Drive needs to be reconnected.";
  }

  return null;
};

export async function GET() {
  const googleCredentials = getOAuthProviderCredentials("google");
  if (!googleCredentials) {
    return NextResponse.json({ message: "Google OAuth is not configured" }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(
    googleCredentials.clientId,
    googleCredentials.clientSecret,
    process.env.OAUTH2_REDIRECT_URI
  );

  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  const googleConnection = await db.google.findUnique({
    where: { userId: user.id },
  });

  if (!googleConnection?.accessToken) {
    return NextResponse.json({ message: "Google Drive is not connected" }, { status: 404 });
  }

  oauth2Client.setCredentials({
    access_token: googleConnection.accessToken,
    refresh_token: googleConnection.refreshToken || undefined,
  });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const response = await drive.files.list();

    if (response) {
      return Response.json(
        {
          message: response.data,
        },
        {
          status: 200,
        }
      );
    } else {
      return Response.json(
        {
          message: "No files found",
        },
        {
          status: 200,
        }
      );
    }
  } catch (err) {
    const connectionError = getGoogleDriveConnectionError(err);
    if (connectionError) {
      return NextResponse.json({ message: connectionError }, { status: 409 });
    }

    console.error("Google Drive file list failed", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
