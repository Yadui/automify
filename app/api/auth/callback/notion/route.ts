// /app/api/auth/callback/notion/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { onNotionConnect } from "@/app/(main)/connections/_actions/notion-connection";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthRedirectUrl } from "@/lib/oauth-redirect";

export async function GET(req: NextRequest) {
  // console.log("SERVER-SIDE CLIENT ID:", process.env.NOTION_CLIENT_ID);
  // console.log("SERVER-SIDE CLIENT SECRET:", process.env.NOTION_CLIENT_SECRET);

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const user = await getAppUser();

  if (!user) {
    console.error("User not authenticated");
    // Use the full, absolute URL for the redirect
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "auth_failed" })
    );
  }

  if (!code) {
    // Use the full, absolute URL for the redirect
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "no_code" })
    );
  }

  // This will now throw an error if the secrets are missing
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Notion Client ID or Secret in .env.local");
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "config_error" })
    );
  }

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NOTION_REDIRECT_URI!,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encoded}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    const notionData = response.data;
    const databaseId = notionData.duplicated_template_id || "";

    await onNotionConnect(
      notionData.access_token,
      notionData.workspace_id,
      notionData.workspace_icon,
      notionData.workspace_name,
      databaseId,
      user.id
    );

    // Use the full, absolute URL for the success redirect
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionStatus: "notion_success" })
    );
  } catch (err: unknown) {
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
      ? err.message
      : err;
    console.error(
      "Notion OAuth Callback Error:",
      errorMessage
    );
    // Use the full, absolute URL for the failure redirect
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "notion_failed" })
    );
  }
}
