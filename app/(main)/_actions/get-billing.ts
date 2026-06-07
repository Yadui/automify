"use server";

import { getAppUser } from "@/lib/app-auth";
import db from "@/lib/db";

/**
 * Fetches credits + tier for the currently signed-in user.
 * Called client-side from BillingProvider so the layout no longer
 * needs to block navigation on this DB query.
 */
export async function getBillingData() {
  const user = await getAppUser();
  if (!user) return null;

  return db.user.findUnique({
    where: { appId: user.id },
    select: { credits: true, tier: true },
  });
}
