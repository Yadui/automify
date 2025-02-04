"use server";

import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const onCreateNodesEdges = async (
  flowId: string,
  nodes: string,
  edges: string,
  flowPath: string
) => {
  const flow = await db.workflows.update({
    where: {
      id: flowId,
    },
    data: {
      nodes,
      edges,
      flowPath: flowPath,
    },
  });

  if (flow) return { message: "flow saved" };
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  console.log(state);
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { credits: true },
  });
  const published = await db.workflows.update({
    where: {
      id: workflowId,
    },
    data: {
      publish: state,
    },
  });
  if (user === null) {
    throw new Error("User not found");
  }
  if (published.publish) {
    // Deduct credits only when publishing
    if (user.credits !== "Unlimited") {
      await db.user.update({
        where: { clerkId: userId },
        data: { credits: `${parseInt(user.credits!) - 1}` },
      });
    }
    return "Workflow published";
  }
  return "Workflow unpublished";
};
