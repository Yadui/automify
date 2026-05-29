import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { isLocalAuthEnabled, LOCAL_AUTH_COOKIE } from "@/lib/local-auth-config";

export type LocalAuthSession = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const getLocalAuthSecret = () => {
  if (process.env.LOCAL_AUTH_SECRET) return process.env.LOCAL_AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") return "automify-local-dev-secret";
  throw new Error("LOCAL_AUTH_SECRET is required when local auth is enabled in production.");
};

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const sign = (payload: string) =>
  crypto.createHmac("sha256", getLocalAuthSecret()).update(payload).digest("base64url");

const verifySignature = (payload: string, signature: string) => {
  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
};

export const normalizeLocalEmail = (email: string) => email.trim().toLowerCase();

export const localAppIdForEmail = (email: string) =>
  `local:${normalizeLocalEmail(email)}`;

export const getOrCreateLocalLoginUser = async (email: string, name?: string) => {
  const normalizedEmail = normalizeLocalEmail(email);
  const displayName = name?.trim() || normalizedEmail.split("@")[0] || "Local User";
  const existingByEmail = await db.user.findUnique({ where: { email: normalizedEmail } });

  if (existingByEmail) {
    return existingByEmail;
  }

  return db.user.create({
    data: {
      appId: localAppIdForEmail(normalizedEmail),
      email: normalizedEmail,
      name: displayName,
      tier: "Free",
      credits: "10",
    },
  });
};

export const createLocalSession = (input: {
  sub: string;
  email: string;
  name?: string | null;
}): LocalAuthSession => ({
  sub: input.sub,
  email: normalizeLocalEmail(input.email),
  name: input.name?.trim() || input.email.split("@")[0] || "Local User",
  exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
});

export const serializeLocalSession = (session: LocalAuthSession) => {
  const payload = encode(session);
  return `${payload}.${sign(payload)}`;
};

export const parseLocalSessionValue = (value?: string): LocalAuthSession | null => {
  if (!isLocalAuthEnabled() || !value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LocalAuthSession;
    if (!session.sub || !session.email || !session.exp) return null;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
};

export const getLocalSession = async () => {
  const cookieStore = await cookies();
  return parseLocalSessionValue(cookieStore.get(LOCAL_AUTH_COOKIE)?.value);
};

export const setLocalSessionCookie = async (session: LocalAuthSession) => {
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_AUTH_COOKIE, serializeLocalSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.exp * 1000),
  });
};

export const clearLocalSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_AUTH_COOKIE);
};

export const ensureLocalSessionUser = async (session: LocalAuthSession) => {
  const existingByAppId = await db.user.findUnique({ where: { appId: session.sub } });
  if (existingByAppId) return existingByAppId;

  const existingByEmail = await db.user.findUnique({ where: { email: session.email } });
  if (existingByEmail) return existingByEmail;

  return db.user.create({
    data: {
      appId: session.sub,
      email: session.email,
      name: session.name,
      tier: "Free",
      credits: "10",
    },
  });
};