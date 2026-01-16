"use server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

export const onCreateNodesEdges = async (
  flowId: string,
  nodes: string,
  edges: string,
  flowPath: string
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
      select: { credits: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // If publishing, check credits
    if (state && user.credits !== "Unlimited") {
      const credits = parseInt(user.credits || "0");
      if (credits <= 0) {
        return { error: "Insufficient credits to publish" };
      }
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
      // Deduct credits only when publishing
      if (user.credits !== "Unlimited") {
        await db.user.update({
          where: { id: userId },
          data: { credits: `${parseInt(user.credits!) - 1}` },
        });
      }
      return { message: "Workflow published successfully" };
    }
    return { message: "Workflow unpublished" };
  } catch (error) {
    console.error("Error publishing workflow:", error);
    return { error: "Failed to update publishing state" };
  }
};
