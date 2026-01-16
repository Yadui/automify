import { NextResponse } from "next/server";
import { getSafeBaseUrl } from "@/lib/utils";
import { validateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const { session } = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = getSafeBaseUrl(request);
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri =
    process.env.NOTION_REDIRECT_URI || `${baseUrl}/api/oauth/notion/callback`;

  // Notion OAuth URL format
  const url = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  return NextResponse.redirect(url);
}
