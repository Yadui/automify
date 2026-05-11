import "server-only";

import db from "@/lib/db";

export const normalizeAuthEmail = (email: string) => email.trim().toLowerCase();

export const authJsAppId = (input: {
  provider?: string;
  providerAccountId?: string;
  email: string;
}) => {
  if (input.provider && input.providerAccountId) {
    return `authjs:${input.provider}:${input.providerAccountId}`;
  }

  return `authjs:${normalizeAuthEmail(input.email)}`;
};

export const getOrCreateAuthJsUser = async (input: {
  email: string;
  name?: string | null;
  provider?: string;
  providerAccountId?: string;
}) => {
  const email = normalizeAuthEmail(input.email);
  const name = input.name?.trim() || email.split("@")[0] || "Automify User";
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return db.user.update({
      where: { email },
      data: {
        name: existing.name || name,
      },
    });
  }

  return db.user.create({
    data: {
      clerkId: authJsAppId({
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        email,
      }),
      email,
      name,
      tier: "Free",
      credits: "10",
    },
  });
};