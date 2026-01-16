"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { google } from "googleapis";

export const sendGmail = async (config: {
  to: string;
  subject: string;
  message: string;
  cc?: string;
  bcc?: string;
}) => {
  const { user } = await validateRequest();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Find Google connection
  const connection = await db.connection.findFirst({
    where: {
      userId: Number(user.id),
      provider: "google",
      status: "active",
    },
  });

  if (!connection) {
    return { success: false, error: "Google account not connected" };
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

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // specific formatting
  const utf8Subject = `=?utf-8?B?${Buffer.from(config.subject).toString(
    "base64"
  )}?=`;
  const headers = [
    `To: ${config.to}`,
    config.cc ? `Cc: ${config.cc}` : "",
    config.bcc ? `Bcc: ${config.bcc}` : "",
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
  ].filter(Boolean);

  const message = headers.join("\n") + "\n\n" + config.message;

  // Encode the message
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      data: {
        messageId: res.data.id,
        threadId: res.data.threadId,
      },
    };
  } catch (error: any) {
    console.error("Gmail send error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
};
