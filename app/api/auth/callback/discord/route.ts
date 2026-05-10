// /app/api/auth/callback/discord/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { onDiscordConnect } from "@/app/(main)/connections/_actions/discord-connections";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthRedirectUrl } from "@/lib/oauth-redirect";

type DiscordGuild = {
  id: string;
  name: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const guild_id = req.nextUrl.searchParams.get("guild_id");
  const state = req.nextUrl.searchParams.get("state");
  const user = await getAppUser();

  if (!user) {
    console.error("User not authenticated");
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "auth_failed" })
    );
  }

  if (!code || !guild_id) {
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "missing_params" })
    );
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.DISCORD_CLIENT_ID!);
  params.append("client_secret", process.env.DISCORD_CLIENT_SECRET!);
  params.append("grant_type", "authorization_code");
  params.append(
    "redirect_uri",
    process.env.DISCORD_REDIRECT_URI!
  );
  params.append("code", code);

  // Also add the 'guilds' scope to the initial auth URL.
  // Example: &scope=webhook.incoming%20guilds
  params.append("scope", "webhook.incoming guilds");

  try {
    // 1. Exchange code for access token and webhook data
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, token_type, webhook } = tokenRes.data;

    if (!webhook) {
      throw new Error("Webhook data not found in Discord response.");
    }

    // 2. NEW STEP: Fetch user's guilds to find the server name
    const guildsRes = await axios.get(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      }
    );

    const userGuilds = guildsRes.data as DiscordGuild[];
    const connectedGuild = userGuilds.find((guild) => guild.id === guild_id);

    if (!connectedGuild) {
      throw new Error(
        "The connected guild was not found in the user's guild list."
      );
    }

    const guildName = connectedGuild.name; // <-- Here is the server name!

    // 3. Call your server action with all the required data
    await onDiscordConnect(
      webhook.channel_id,
      webhook.id,
      webhook.name,
      webhook.url,
      user.id,
      guildName, // <-- Pass the fetched guild name
      guild_id
    );

    // 4. Redirect to your frontend
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionStatus: "discord_success" })
    );
  } catch (err: unknown) {
    const errorMessage = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
      ? err.message
      : err;
    console.error("OAuth Callback Error:", errorMessage);
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "discord_failed" })
    );
  }
}
