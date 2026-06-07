import { NextRequest, NextResponse } from "next/server";
import { connectorTypeSchema, getConnector } from "@/lib/connectors";
import { buildConnectorOAuthUrl, appendOAuthResult, getSafeReturnPath } from "@/lib/oauth-redirect";
import { lucia } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getLocalSession } from "@/lib/local-auth";
import db from "@/lib/db";

const connectorCallbackPaths = {
  Discord: "/api/oauth/discord/callback",
  Notion: "/api/oauth/notion/callback",
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

  // For connectors that use our own callback (e.g. Discord, Notion), resolve the user here
  // where the session cookie is reliably available, and embed userId (appId) in state.
  let userId: string | null = null;
  if (parsedType.data === "Discord" || parsedType.data === "Notion") {
    // 1. Try Lucia session (password / Google-via-Lucia login)
    const cookieHeader = req.headers.get("cookie") ?? "";
    const sessionId =
      cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${lucia.sessionCookieName}=`))
        ?.split("=")
        .slice(1)
        .join("=") ?? null;

    if (sessionId) {
      const { user: luciaUser } = await lucia.validateSession(sessionId);
      if (luciaUser?.id) {
        // Lucia user.id is the numeric User.id as string — look up the appId
        const dbUser = await db.user.findUnique({ where: { id: Number(luciaUser.id) } });
        if (dbUser) userId = dbUser.appId;
      }
    }

    // 2. Fall back to NextAuth session (Google / GitHub login)
    // session.user.id is already the appId string (set from token.appUserId in auth-options)
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) userId = session.user.id;
    }

    // 3. Fall back to local auth session — localSession.sub is the appId
    if (!userId) {
      const localSession = await getLocalSession();
      if (localSession?.sub) userId = localSession.sub;
    }

    if (!userId) {
      return NextResponse.redirect(new URL(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`, req.nextUrl.origin));
    }
  }

  const connector = getConnector(parsedType.data);
  const callbackPath = connectorCallbackPaths[parsedType.data as keyof typeof connectorCallbackPaths];
  // Prefer the explicit env-var redirect URI so that the authorize step and the
  // token-exchange step always send the exact same string. Fall back to deriving
  // from the request origin only when no env var is set.
  const redirectUri = callbackPath
    ? process.env[connector.oauth?.redirectUriEnv ?? ""] || new URL(callbackPath, req.nextUrl.origin).toString()
    : process.env[connector.oauth?.redirectUriEnv ?? ""];
  const authUrl = buildConnectorOAuthUrl(parsedType.data, { returnTo, userId: userId ?? undefined }, { redirectUri });

  if (!authUrl) {
    const redirectPath = appendOAuthResult(returnTo, { connectionError: "oauth_unavailable" });
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin));
  }

  return NextResponse.redirect(authUrl);
}
