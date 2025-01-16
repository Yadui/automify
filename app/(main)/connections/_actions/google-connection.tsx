//google-connection.tsx
// WIP: connection to google drive
import { Clerk } from "@clerk/clerk-sdk";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";

export const getFileMetaData = async () => {
  "use server";

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  );

  const { userId } = await auth();

  if (!userId) {
    return { message: "User not found" };
  }

  const clerk = new Clerk({
    apiKey: process.env.CLERK_SECRET_KEY, // Ensure your Clerk API Key is set in .env
  });

  const clerkResponse = await clerk.users.getUserOauthAccessToken(
    userId,
    "oauth_google"
  );

  if (!clerkResponse || clerkResponse.length === 0) {
    return { message: "No OAuth tokens found for the user." };
  }

  const accessToken = clerkResponse[0].token;

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const response = await drive.files.list();

  return response?.data || { message: "No files found." };
};
