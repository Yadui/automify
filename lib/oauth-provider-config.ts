export type OAuthProviderId = "google" | "github";

type OAuthProviderDefinition = {
  id: OAuthProviderId;
  name: string;
  clientIdEnv: string[];
  clientSecretEnv: string[];
};

export const oauthProviderDefinitions: OAuthProviderDefinition[] = [
  {
    id: "google",
    name: "Google",
    clientIdEnv: ["AUTH_GOOGLE_ID", "GOOGLE_CLIENT_ID", "NEXT_PUBLIC_GOOGLE_CLIENT_ID"],
    clientSecretEnv: ["AUTH_GOOGLE_SECRET", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "github",
    name: "GitHub",
    clientIdEnv: ["AUTH_GITHUB_ID", "AUTH_GITHUB_CLIENT_ID", "GITHUB_CLIENT_ID"],
    clientSecretEnv: ["AUTH_GITHUB_SECRET", "AUTH_GITHUB_CLIENT_SECRET", "GITHUB_CLIENT_SECRET"],
  },
];

const readFirstEnv = (names: string[]) => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
};

export const getOAuthProviderCredentials = (providerId: OAuthProviderId) => {
  const definition = oauthProviderDefinitions.find((provider) => provider.id === providerId);
  if (!definition) return null;

  const clientId = readFirstEnv(definition.clientIdEnv);
  const clientSecret = readFirstEnv(definition.clientSecretEnv);

  if (!clientId || !clientSecret) return null;

  return {
    clientId,
    clientSecret,
  };
};

export const getConfiguredOAuthProviders = () =>
  oauthProviderDefinitions
    .filter((provider) => Boolean(getOAuthProviderCredentials(provider.id)))
    .map((provider) => ({ id: provider.id, name: provider.name }));