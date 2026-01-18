import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import axios from "axios";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Parse returnUrl from state
  let returnUrl = "/connections";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      returnUrl = decoded.returnUrl || "/connections";
    } catch {
      // Invalid state, use default
    }
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const authHeader = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString("base64");

    const baseUrl = getSafeBaseUrl(request);
    const redirectUri =
      process.env.NOTION_REDIRECT_URI || `${baseUrl}/api/oauth/notion/callback`;
    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
      }
    );

    const tokens = response.data;

    // Record the connection using workspace_id as providerAccountId
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: Number(user.id),
          provider: "notion",
          providerAccountId: tokens.workspace_id,
        },
      },
      update: {
        accessToken: tokens.access_token,
        metadata: {
          workspaceName: tokens.workspace_name,
          workspaceIcon: tokens.workspace_icon,
          botId: tokens.bot_id,
          owner: tokens.owner,
        },
        status: "active",
      },
      create: {
        userId: Number(user.id),
        provider: "notion",
        providerAccountId: tokens.workspace_id,
        accessToken: tokens.access_token,
        metadata: {
          workspaceName: tokens.workspace_name,
          workspaceIcon: tokens.workspace_icon,
          botId: tokens.bot_id,
          owner: tokens.owner,
        },
        status: "active",
      },
    });

    // Redirect to original page
    return NextResponse.redirect(`${baseUrl}${returnUrl}`);
  } catch (error) {
    console.error("Notion OAuth Callback Error:", error);
    return NextResponse.json(
      { error: "Failed to link Notion account" },
      { status: 500 }
    );
  }
}
