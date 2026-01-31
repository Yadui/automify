import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Assigns a license to a user based on their tier and adds credits.
 */
export const onAssignLicense = async (userId: number, tier: string) => {
  try {
    let creditsToAdd = 0;
    switch (tier) {
      case "Pro":
        creditsToAdd = 100;
        break;
      case "Unlimited":
        creditsToAdd = 999999; // Representing unlimited as a large number or handling separately
        break;
      default:
        creditsToAdd = 10;
    }

    // Create the license record
    const license = await db.license.create({
      data: {
        userId,
        tier,
        creditsAdded: creditsToAdd,
        licenseKey: `LIC-${tier.toUpperCase()}-${uuidv4().split("-")[0]}`,
      },
    });

    // Update the user's tier and credits
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        tier,
        credits: {
          increment: creditsToAdd,
        },
      },
    });

    return { success: true, license, user: updatedUser };
  } catch (error) {
    console.error("License assignment error:", error);
    return { success: false, error: "Failed to assign license" };
  }
};
