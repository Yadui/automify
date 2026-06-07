import db from "@/lib/db";
import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import { getSafeBaseUrl } from "@/lib/utils";
import { decodeOAuthState, appendOAuthResult } from "@/lib/oauth-redirect";

// Mirror the same AES-256-CBC encryption used in notion-connection.tsx so the
// token is stored in a format the wizard's decrypt() can read back.
function encryptToken(text: string): string {
  const key = process.env.NOTION_ENCRYPTION_KEY!;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function GET(request: Request) {
  const baseUrl = getSafeBaseUrl(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const decoded = decodeOAuthState(state);
  const userAppId = decoded.userId ?? null;
  const returnUrl = decoded.returnTo || "/connections";

  if (!userAppId) {
    console.error("[notion/callback] No userId in state");
    return NextResponse.redirect(`${baseUrl}/sign-in?returnTo=${encodeURIComponent(returnUrl)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}${appendOAuthResult(returnUrl, { connectionError: "no_code" })}`);
  }

  try {
    const authHeader = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString("base64");

    const redirectUri =
      process.env.NOTION_REDIRECT_URI || `${baseUrl}/api/oauth/notion/callback`;

    console.log("[notion/callback] Token exchange redirect_uri:", redirectUri);

    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      { grant_type: "authorization_code", code, redirect_uri: redirectUri },
      { headers: { Authorization: `Basic ${authHeader}`, "Content-Type": "application/json" } }
    );

    const tokens = response.data;
    const encryptedToken = encryptToken(tokens.access_token);
    const workspaceName = tokens.workspace_name || "Notion Workspace";
    const workspaceIcon = tokens.workspace_icon || "";
    const workspaceId   = tokens.workspace_id as string;

    const existing = await db.notion.findFirst({ where: { userId: userAppId } });

    if (existing) {
      // Update token + workspace info; leave databaseId and relations intact.
      await db.notion.update({
        where: { userId: userAppId },
        data: {
          accessToken: encryptedToken,
          workspaceId,
          workspaceIcon,
          workspaceName,
          connections: {
            upsert: {
              where: { userId_type: { userId: userAppId, type: "Notion" } },
              create: { userId: userAppId, type: "Notion", settings: {} },
              update: { status: "active" },
            },
          },
        },
      });
    } else {
      // First-time connection — databaseId is required + @unique in the schema.
      // Use workspaceId as a placeholder; it will be overwritten when the user
      // selects a real database inside the wizard.
      await db.notion.create({
        data: {
          userId:        userAppId,
          accessToken:   encryptedToken,
          workspaceId,
          workspaceIcon,
          workspaceName,
          databaseId:    workspaceId, // placeholder until wizard step 2
          connections: {
            create: { userId: userAppId, type: "Notion", settings: {} },
          },
        },
      });
    }

    console.log("[notion/callback] Connection saved for", userAppId);
    return NextResponse.redirect(`${baseUrl}${returnUrl}`);
  } catch (error: any) {
    console.error("Notion OAuth Callback Error:", error?.response?.data || error);
    return NextResponse.redirect(
      `${baseUrl}${appendOAuthResult(returnUrl, { connectionError: "oauth_failed" })}`
    );
  }
}
