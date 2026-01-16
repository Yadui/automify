import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { getSafeBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const { session } = await validateRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = getSafeBaseUrl(request);
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI || `${baseUrl}/api/oauth/discord/callback`;
  const scope = "webhook.incoming"; // Creates webhook during OAuth - user selects channel

  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(url);
}
