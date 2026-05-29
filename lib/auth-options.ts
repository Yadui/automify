import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { getOrCreateAuthJsUser } from "@/lib/auth-users";
import { nextAuthSecret } from "@/lib/auth-secret";
import { getOAuthProviderCredentials } from "@/lib/oauth-provider-config";
import { onGoogleDriveConnect } from "@/app/(main)/connections/_actions/google-connection";

const googleCredentials = getOAuthProviderCredentials("google");
const githubCredentials = getOAuthProviderCredentials("github");

const googleConnectorScopes = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

const hasGoogleConnectorScope = (scope: unknown) =>
  typeof scope === "string" && googleConnectorScopes.some((connectorScope) => scope.includes(connectorScope));

const providers: NextAuthOptions["providers"] = [];

if (googleCredentials) {
  providers.push(
    GoogleProvider({
      clientId: googleCredentials.clientId,
      clientSecret: googleCredentials.clientSecret,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
}

if (githubCredentials) {
  providers.push(
    GitHubProvider({
      clientId: githubCredentials.clientId,
      clientSecret: githubCredentials.clientSecret,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  logger: {
    error(code, metadata) {
      // A session cookie encrypted with a previous/rotated secret cannot be
      // decrypted (JWEDecryptionFailed). This is benign — the user is simply
      // treated as logged out and re-authenticates — so don't spam it.
      if (code === "JWT_SESSION_ERROR") return;
      console.error(`[next-auth][error][${code}]`, metadata);
    },
    warn(code) {
      console.warn(`[next-auth][warn][${code}]`);
    },
    debug() {},
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      await getOrCreateAuthJsUser({
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
      });

      return true;
    },
    async jwt({ token, user, account }) {
      const email = user?.email || token.email;
      if (!email) return token;

      if (!token.appUserId || user || account) {
        const appUser = await getOrCreateAuthJsUser({
          email,
          name: user?.name || token.name,
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
        });

        if (
          account?.provider === "google" &&
          account.access_token &&
          hasGoogleConnectorScope(account.scope)
        ) {
          await onGoogleDriveConnect(
            account.access_token,
            account.refresh_token,
            appUser.appId,
            account.scope
          );
        }

        token.appUserId = appUser.appId;
        token.name = appUser.name || token.name;
        token.email = appUser.email;
        token.picture = null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.appUserId || token.sub || "");
        session.user.source = "authjs";
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.image = null;
      }

      return session;
    },
  },
};