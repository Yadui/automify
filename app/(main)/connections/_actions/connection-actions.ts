"use server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Disconnects a provider by deleting all connection records for that provider for the current user.
 * @param title The UI title of the connection (e.g. "Google Drive", "Discord", "Gmail")
 */
export const disconnectConnection = async (title: string) => {
  const { user } = await validateRequest();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Map UI titles to provider names in DB
  let provider = title.toLowerCase();
  if (title === "Google Drive" || title === "Gmail") {
    provider = "google";
  }

  try {
    await db.connection.deleteMany({
      where: {
        userId: Number(user.id),
        provider: provider,
      },
    });

    revalidatePath("/connections");
    revalidatePath("/settings");

    return { success: true };
  } catch (error: any) {
    console.error(`Error disconnecting ${title}:`, error);
    return {
      success: false,
      error: error.message || `Failed to disconnect ${title}`,
    };
  }
};
