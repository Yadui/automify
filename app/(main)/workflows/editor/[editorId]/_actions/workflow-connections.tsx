"use server";

import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";

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
  const user = await getAppUser();

  if (!user) {
    throw new Error("User not authenticated");
  }
  const dbUser = await db.user.findUnique({
    where: { appId: user.id },
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
  if (dbUser === null) {
    throw new Error("User not found");
  }
  if (published.publish) {
    // Deduct credits only when publishing
    if (dbUser.credits !== "Unlimited") {
      await db.user.update({
        where: { appId: user.id },
        data: { credits: `${parseInt(dbUser.credits!) - 1}` },
      });
    }
    return "Workflow published";
  }
  return "Workflow unpublished";
};
