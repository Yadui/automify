import { google } from "googleapis";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthProviderCredentials } from "@/lib/oauth-provider-config";

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

  const channelId = uuidv4();

  const startPageTokenRes = await drive.changes.getStartPageToken({});
  const startPageToken = startPageTokenRes.data.startPageToken;
  if (startPageToken == null) {
    throw new Error("startPageToken is unexpectedly null");
  }

  const listener = await drive.changes.watch({
    pageToken: startPageToken,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    requestBody: {
      id: channelId,
      type: "web_hook",
      address: `${process.env.NGROK_URI}/api/drive-activity/notification`,
      kind: "api#channel",
    },
  });

  if (listener.status == 200) {
    //if listener created store its channel id in db
    const channelStored = await db.user.updateMany({
      where: {
        clerkId: user.id,
      },
      data: {
        googleResourceId: listener.data.resourceId,
      },
    });

    if (channelStored) {
      return new NextResponse("Listening to changes...");
    }
  }

  return new NextResponse("Oops! something went wrong, try again");
}
