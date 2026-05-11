import { appendOAuthResult, getSafeReturnPath } from "@/lib/oauth-redirect";
import { connectorTypeSchema, getConnector } from "@/lib/connectors";
import GoogleConnectorSignIn from "./sign-in-client";

type GoogleOAuthConnectPageProps = {
  searchParams?: Promise<{
    returnTo?: string;
    type?: string;
  }>;
};

const googleBaseScopes = ["openid", "email", "profile"];

const GoogleOAuthConnectPage = async ({ searchParams }: GoogleOAuthConnectPageProps) => {
  const params = (await searchParams) ?? {};
  const parsedType = connectorTypeSchema.safeParse(params.type);
  const returnTo = getSafeReturnPath(params.returnTo);

  if (!parsedType.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-[#171717]">Unable to start Google connection</h1>
          <p className="mt-2 text-sm text-[#666666]">The selected connector is not available.</p>
        </div>
      </div>
    );
  }

  const connector = getConnector(parsedType.data);
  const scopes = Array.from(new Set([...googleBaseScopes, ...(connector.oauth?.scopes ?? [])])).join(" ");
  const callbackUrl = appendOAuthResult(returnTo, { connectionStatus: "google_success" });

  return (
    <GoogleConnectorSignIn
      callbackUrl={callbackUrl}
      connectorTitle={connector.title}
      scopes={scopes}
    />
  );
};

export default GoogleOAuthConnectPage;