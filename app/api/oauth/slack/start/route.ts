import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { getSafeBaseUrl } from "@/lib/utils";

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

  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri =
    process.env.SLACK_REDIRECT_URI || `${baseUrl}/api/oauth/slack/callback`;
  const scope = "channels:read,chat:write,commands,incoming-webhook";

  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(
    state
  )}`;

  return NextResponse.redirect(authUrl);
}
