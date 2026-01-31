"use server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

export const onCreateNodesEdges = async (
  flowId: string,
  nodes: string,
  edges: string,
  flowPath: string,
) => {
  try {
    const flow = await db.workflow.update({
      where: {
        id: flowId,
      },
      data: {
        nodes,
        edges,
        flowPath: flowPath,
      },
    });

    if (flow) return { message: "Workflow saved successfully" };
  } catch (error) {
    console.error("Error saving workflow:", error);
    return { error: "Failed to save workflow" };
  }
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  try {
    const { user: authUser } = await validateRequest();

    if (!authUser) {
      return { error: "User not authenticated" };
    }

    const userId = Number(authUser.id);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true, tier: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Check credits only if publishing (not unpublishing)
    // Note: Credits are deducted on workflow execution, not on publish
    if (state && user.tier !== "Unlimited" && user.credits <= 0) {
      return {
        error:
          "Insufficient credits. Run workflows to earn more or upgrade your plan.",
      };
    }

    const published = await db.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        publish: state,
      },
    });

    if (published.publish) {
      return { message: "Workflow published successfully" };
    }
    return { message: "Workflow unpublished" };
  } catch (error) {
    console.error("Error publishing workflow:", error);
    return { error: "Failed to update publishing state" };
  }
};
