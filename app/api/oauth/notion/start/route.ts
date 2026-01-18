import { NextResponse } from "next/server";
import { getSafeBaseUrl } from "@/lib/utils";
import { validateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const { session } = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = getSafeBaseUrl(request);
  const url = new URL(request.url);
  const returnUrl = url.searchParams.get("returnUrl") || "/connections";

  // Encode returnUrl in state parameter
  const state = Buffer.from(JSON.stringify({ returnUrl })).toString("base64");

  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri =
    process.env.NOTION_REDIRECT_URI || `${baseUrl}/api/oauth/notion/callback`;

  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(authUrl);
}
