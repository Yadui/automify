import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { session } = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = getSafeBaseUrl(request);
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri =
    process.env.SLACK_REDIRECT_URI || `${baseUrl}/api/oauth/slack/callback`;
  const scope = "channels:read,chat:write,commands,incoming-webhook"; // Example scopes

  const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(url);
}
