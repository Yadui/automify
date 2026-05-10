import { NextRequest, NextResponse } from "next/server";
import { onSlackConnect } from "@/app/(main)/connections/_actions/slack-connection";
import { getAppUser } from "@/lib/app-auth";
import { getOAuthRedirectUrl } from "@/lib/oauth-redirect";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const user = await getAppUser();

  if (!user) {
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "auth_failed" })
    );
  }

  if (!code) {
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "no_code" })
    );
  }

  try {
    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || "Slack OAuth failed");
    }

    const authedUserToken = data.authed_user?.access_token || "";

    // Call the server action to save the data to the database
    await onSlackConnect(
      data.app_id,
      data.authed_user.id,
      authedUserToken,
      data.access_token,
      data.bot_user_id,
      data.team.id,
      data.team.name,
      user.id
    );

    // Perform a clean redirect
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionStatus: "slack_success" })
    );
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      getOAuthRedirectUrl(req, state, { connectionError: "slack_failed" })
    );
  }
}
