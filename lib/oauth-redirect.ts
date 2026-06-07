import type { NextRequest } from "next/server";
import { getConnector, type ConnectorType } from "./connectors";
import { getOAuthProviderCredentials } from "./oauth-provider-config";

type OAuthReturnState = {
  returnTo?: string;
  userId?: string;
};

export const getSafeReturnPath = (value: string | null | undefined, fallback = "/connections") => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, "http://automify.local");
    if (url.origin !== "http://automify.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
};

export const encodeOAuthState = (state: OAuthReturnState) =>
  Buffer.from(JSON.stringify(state), "utf8").toString("base64url");

export const decodeOAuthState = (value: string | null | undefined): OAuthReturnState => {
  if (!value) return {};

  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return decoded && typeof decoded === "object" ? decoded : {};
  } catch {
    return {};
  }
};

export const appendOAuthResult = (
  returnPath: string,
  result: Record<string, string | undefined>
) => {
  const url = new URL(returnPath, "http://automify.local");

  Object.entries(result).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}${url.hash}`;
};

export const getOAuthRedirectUrl = (
  req: NextRequest,
  state: string | null | undefined,
  result: Record<string, string | undefined>,
  fallback = "/connections"
) => {
  const decodedState = decodeOAuthState(state);
  const returnPath = getSafeReturnPath(decodedState.returnTo, fallback);
  const returnPathWithResult = appendOAuthResult(returnPath, result);
  return new URL(returnPathWithResult, req.nextUrl.origin).toString();
};

export const buildConnectorOAuthUrl = (
  type: ConnectorType,
  state?: OAuthReturnState,
  options?: { redirectUri?: string }
) => {
  const connector = getConnector(type);
  if (!connector.oauth) return null;

  const googleCredentials = connector.oauth.authorizationUrl.includes("accounts.google.com")
    ? getOAuthProviderCredentials("google")
    : null;
  const clientId = googleCredentials?.clientId ?? process.env[connector.oauth.clientIdEnv];
  const redirectUri = options?.redirectUri ?? process.env[connector.oauth.redirectUriEnv];
  if (!clientId || !redirectUri) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  if (connector.oauth.responseType) {
    params.set("response_type", connector.oauth.responseType);
  }

  if (connector.oauth.scopes.length > 0) {
    params.set(
      "scope",
      type === "Slack" ? connector.oauth.scopes.join(",") : connector.oauth.scopes.join(" ")
    );
  }

  if (state?.returnTo || state?.userId) {
    params.set("state", encodeOAuthState({
      returnTo: state.returnTo ? getSafeReturnPath(state.returnTo) : undefined,
      userId: state.userId,
    }));
  }

  Object.entries(connector.oauth.extraParams ?? {}).forEach(([key, value]) => {
    params.set(key, value);
  });

  return `${connector.oauth.authorizationUrl}?${params.toString()}`;
};