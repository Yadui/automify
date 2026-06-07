import { google } from "googleapis";
import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await db.connection.findFirst({
    where: {
      userId: Number(user.id),
      provider: "google",
      status: "active",
    },
  });

  if (!connection) {
    return NextResponse.json(
      { message: "Google account not connected" },
      { status: 400 }
    );
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

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const channelId = uuidv4();

  try {
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

    if (listener.status === 200) {
      // Update the user with the resource ID
      await db.user.update({
        where: {
          id: Number(user.id),
        },
        data: {
          googleResourceId: listener.data.resourceId,
        },
      });

      return new NextResponse("Listening to changes...");
    }
  } catch (err) {
    console.error(err);
    return new NextResponse("Oops! something went wrong, try again", {
      status: 500,
    });
  }

  return new NextResponse("Oops! something went wrong, try again", {
    status: 500,
  });
}
