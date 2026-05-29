import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ensureLocalSessionUser, getLocalSession } from "@/lib/local-auth";

export type AppAuthUser = {
  id: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  source: "authjs" | "local";
};

export const getAppUser = async (): Promise<AppAuthUser | null> => {
  const session = await getServerSession(authOptions);

  if (session?.user?.id && session.user.email) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      imageUrl: null,
      source: "authjs",
    };
  }

  const localSession = await getLocalSession();
  if (!localSession) return null;

  const user = await ensureLocalSessionUser(localSession);
  return {
    id: user.appId,
    email: user.email,
    name: user.name ?? localSession.name,
    imageUrl: null,
    source: "local",
  };
};

export const requireAppUser = async () => {
  const user = await getAppUser();
  if (!user) throw new Error("User not authenticated");
  return user;
};