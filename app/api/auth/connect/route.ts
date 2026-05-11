import { NextRequest, NextResponse } from "next/server";
import { connectorTypeSchema, getConnector } from "@/lib/connectors";
import { buildConnectorOAuthUrl, appendOAuthResult, getSafeReturnPath } from "@/lib/oauth-redirect";

const connectorCallbackPaths = {
  Discord: "/api/auth/callback/discord",
  Notion: "/api/auth/callback/notion",
  Slack: "/api/auth/callback/slack",
} as const;

const nextAuthGoogleConnectors = new Set(["Google Drive", "Gmail", "Google Calendar"]);

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "";
  const returnTo = getSafeReturnPath(req.nextUrl.searchParams.get("returnTo"));
  const parsedType = connectorTypeSchema.safeParse(type);

  if (!parsedType.success) {
    const redirectPath = appendOAuthResult(returnTo, { connectionError: "invalid_connector" });
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
  }

  if (nextAuthGoogleConnectors.has(parsedType.data)) {
    const redirectPath = `/oauth-connect/google?${new URLSearchParams({
      type: parsedType.data,
      returnTo,
    }).toString()}`;

    return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
  }

  const connector = getConnector(parsedType.data);
  const callbackPath = connectorCallbackPaths[parsedType.data as keyof typeof connectorCallbackPaths];
  const redirectUri = callbackPath
    ? new URL(callbackPath, req.nextUrl.origin).toString()
    : process.env[connector.oauth?.redirectUriEnv ?? ""];
  const authUrl = buildConnectorOAuthUrl(parsedType.data, { returnTo }, { redirectUri });

  if (!authUrl) {
    const redirectPath = appendOAuthResult(returnTo, { connectionError: "oauth_unavailable" });
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
  }

  return NextResponse.redirect(authUrl);
}