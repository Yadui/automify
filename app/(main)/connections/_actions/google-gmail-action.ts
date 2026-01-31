"use server";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { google } from "googleapis";

const setupGmailClient = async (userId: number) => {
  // Find Google connection
  const connection = await db.connection.findFirst({
    where: {
      userId: userId,
      provider: "google",
      status: "active",
    },
  });

  if (!connection) {
    throw new Error("Google account not connected");
  }

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
    // 5 min buffer
    try {
      await oauth2Client.getAccessToken();
    } catch (e) {
      console.error("Proactive Gmail refresh failed:", e);
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

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  return { gmail, oauth2Client, connection };
};

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

  try {
    const { gmail } = await setupGmailClient(Number(user.id));

    // specific formatting
    const utf8Subject = `=?utf-8?B?${Buffer.from(config.subject).toString(
      "base64",
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
    // If it's an auth error, it might be due to revoked token even with refresh logic
    if (
      error.response?.status === 401 ||
      error.response?.data?.error === "invalid_grant"
    ) {
      return {
        success: false,
        error: "Authentication failed. Please reconnect your Google account.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
};

export const testGmailConnection = async () => {
  const { user } = await validateRequest();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { gmail, oauth2Client, connection } = await setupGmailClient(
      Number(user.id),
    );

    console.log("[Gmail Test] Token availability:", {
      hasAccessToken: !!oauth2Client.credentials.access_token,
      hasRefreshToken: !!connection.refreshToken,
      expiresAt: connection.expiresAt,
    });

    // Test connection by getting user info (uses 'email' scope, avoids 'gmail.readonly' requirement)
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const res = await oauth2.userinfo.get();

    return {
      success: true,
      data: {
        emailAddress: res.data.email,
      },
    };
  } catch (error: any) {
    console.error("Gmail test connection error:", error);
    if (
      error.response?.status === 401 ||
      error.response?.data?.error === "invalid_grant"
    ) {
      return {
        success: false,
        error: "Authentication failed. Please reconnect your Google account.",
      };
    }
    if (error.response?.status === 403) {
      return {
        success: false,
        error:
          "Insufficient permissions. Please reconnect and grant Gmail access.",
      };
    }
    return {
      success: false,
      error: error.message || "Failed to validate connection",
    };
  }
};
