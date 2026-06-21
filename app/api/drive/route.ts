import { google } from "googleapis";
import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await db.connections.findFirst({
    where: {
      userId: String(user.id),
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

  const settings = (connection.settings || {}) as Record<string, any>;
  oauth2Client.setCredentials({
    access_token: settings.accessToken,
    refresh_token: settings.refreshToken || undefined,
  });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  try {
    const response = await drive.files.list();

    if (response) {
      return NextResponse.json(
        {
          message: response.data,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "No files found",
        },
        {
          status: 200,
        }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
