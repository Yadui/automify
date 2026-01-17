"use server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

/**
 * Export user data as JSON
 * Includes: profile, workflows, connection metadata (not tokens)
 * Excludes: OAuth tokens, secrets, execution logs, third-party content
 */
export async function exportUserData() {
  const { user: authUser } = await validateRequest();
  if (!authUser) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = Number(authUser.id);

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        tier: true,
        credits: true,
        createdAt: true,
        // Exclude: hashedPassword, deletionScheduledAt
      },
    });

    const workflows = await db.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        nodes: true,
        edges: true,
        publish: true,
        flowPath: true,
        cronPath: true,
        createdAt: true,
        updatedAt: true,
        // Templates and channel configs
        discordTemplate: true,
        slackTemplate: true,
        slackChannels: true,
        notionTemplate: true,
        notionDbId: true,
      },
    });

    // Connection metadata only - no tokens
    const connections = await db.connection.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        status: true,
        createdAt: true,
        // Exclude: accessToken, refreshToken, providerAccountId
      },
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
      account: user,
      workflows: workflows,
      connections: connections.map((c) => ({
        provider: c.provider,
        status: c.status,
        connectedAt: c.createdAt,
      })),
    };

    return {
      success: true,
      data: exportData,
      filename: `automify-export-${
        new Date().toISOString().split("T")[0]
      }.json`,
    };
  } catch (error) {
    console.error("Export error:", error);
    return { success: false, error: "Failed to export data" };
  }
}

/**
 * Schedule account for deletion (48-hour grace period)
 */
export async function scheduleAccountDeletion() {
  const { user: authUser } = await validateRequest();
  if (!authUser) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = Number(authUser.id);

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        deletionScheduledAt: new Date(),
      },
    });

    return {
      success: true,
      message:
        "Account scheduled for deletion. You have 48 hours to cancel this action.",
      deletionDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error("Deletion scheduling error:", error);
    return { success: false, error: "Failed to schedule deletion" };
  }
}

/**
 * Cancel scheduled account deletion
 */
export async function cancelAccountDeletion() {
  const { user: authUser } = await validateRequest();
  if (!authUser) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = Number(authUser.id);

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        deletionScheduledAt: null,
      },
    });

    return {
      success: true,
      message: "Account deletion cancelled. Your account is now active.",
    };
  } catch (error) {
    console.error("Cancel deletion error:", error);
    return { success: false, error: "Failed to cancel deletion" };
  }
}

/**
 * Get user deletion status
 */
export async function getDeletionStatus() {
  const { user: authUser } = await validateRequest();
  if (!authUser) {
    return { scheduled: false };
  }

  const userId = Number(authUser.id);

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { deletionScheduledAt: true },
    });

    if (user?.deletionScheduledAt) {
      const deletionDate = new Date(
        user.deletionScheduledAt.getTime() + 48 * 60 * 60 * 1000
      );
      const hoursRemaining = Math.max(
        0,
        Math.ceil((deletionDate.getTime() - Date.now()) / (60 * 60 * 1000))
      );

      return {
        scheduled: true,
        scheduledAt: user.deletionScheduledAt.toISOString(),
        deletionDate: deletionDate.toISOString(),
        hoursRemaining,
      };
    }

    return { scheduled: false };
  } catch (error) {
    console.error("Get deletion status error:", error);
    return { scheduled: false };
  }
}
