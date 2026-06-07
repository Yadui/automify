"use server";

import { redirect } from "next/navigation";
import {
  clearLocalSessionCookie,
  createLocalSession,
  getOrCreateLocalLoginUser,
  normalizeLocalEmail,
  setLocalSessionCookie,
} from "@/lib/local-auth";
import { isLocalAuthEnabled } from "@/lib/local-auth-config";

export type LocalLoginState = {
  error?: string;
};

const validateLocalCredentials = (email: string, password: string) => {
  if (!isLocalAuthEnabled()) {
    return "Local login is not enabled.";
  }

  if (!email.includes("@") || password.length < 4) {
    return "Use a valid email and a password with at least 4 characters.";
  }

  const configuredEmail = process.env.LOCAL_AUTH_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.LOCAL_AUTH_PASSWORD;

  if (configuredEmail || configuredPassword) {
    if (!configuredEmail || !configuredPassword) {
      return "LOCAL_AUTH_EMAIL and LOCAL_AUTH_PASSWORD must both be set.";
    }

    if (normalizeLocalEmail(email) !== configuredEmail || password !== configuredPassword) {
      return "Invalid local login credentials.";
    }
  }

  if (process.env.NODE_ENV === "production" && !configuredPassword) {
    return "Set LOCAL_AUTH_EMAIL and LOCAL_AUTH_PASSWORD before using local login in production.";
  }

  return null;
};

export const localLoginAction = async (
  _previousState: LocalLoginState,
  formData: FormData
): Promise<LocalLoginState> => {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");
  const validationError = validateLocalCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const user = await getOrCreateLocalLoginUser(email, name);
  const session = createLocalSession({
    sub: user.clerkId,
    email: user.email,
    name: user.name,
  });

  await setLocalSessionCookie(session);
  redirect("/dashboard");
};

export const localLogoutAction = async () => {
  await clearLocalSessionCookie();
  redirect("/sign-in");
};