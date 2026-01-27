"use server";
import { Option } from "@/components/ui/multiple-select";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

export const getGoogleListener = async () => {
  const { user } = await validateRequest();

  if (user) {
    const listener = await db.user.findUnique({
      where: {
        id: Number(user.id),
      },
      select: {
        googleResourceId: true,
      },
    });

    if (listener) return listener;
  }
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  const published = await db.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      publish: state,
    },
  });

  if (published.publish) return "Workflow published";
  return "Workflow unpublished";
};

export const onCreateNodeTemplate = async (
  content: string,
  type: string,
  workflowId: string,
  channels?: Option[],
  accessToken?: string, // Legacy param, we won't store it in workflow anymore
  notionDbId?: string,
) => {
  if (type === "Discord") {
    const response = await db.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        discordTemplate: content,
      },
    });

    if (response) {
      return "Discord template saved";
    }
  }
  if (type === "Slack") {
    const response = await db.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        slackTemplate: content,
        // We do NOT store slackAccessToken in workflow anymore
      },
    });

    if (response) {
      const channelList = await db.workflow.findUnique({
        where: {
          id: workflowId,
        },
        select: {
          slackChannels: true,
        },
      });

      if (channelList) {
        //remove duplicates before insert
        const NonDuplicated = channelList.slackChannels.filter(
          (channel) =>
            channel !==
            (channels && channels.length > 0 ? channels[0].value : ""),
        );

        const promises = NonDuplicated.map((channel) =>
          db.workflow.update({
            where: {
              id: workflowId,
            },
            data: {
              slackChannels: {
                push: channel,
              },
            },
          }),
        );

        await Promise.all(promises);
        return "Slack template saved";
      }

      if (channels && channels.length > 0) {
        const promises = channels.map((channel) =>
          db.workflow.update({
            where: {
              id: workflowId,
            },
            data: {
              slackChannels: {
                push: channel.value,
              },
            },
          }),
        );
        await Promise.all(promises);
      }
      return "Slack template saved";
    }
  }

  if (type === "Notion") {
    const response = await db.workflow.update({
      where: {
        id: workflowId,
      },
      data: {
        notionTemplate: content,
        // We do NOT store notionAccessToken in workflow anymore
        notionDbId: notionDbId,
      },
    });

    if (response) return "Notion template saved";
  }
};

export const onGetWorkflows = async () => {
  const { user } = await validateRequest();
  if (user) {
    const workflows = await db.workflow.findMany({
      where: {
        userId: Number(user.id),
      },
    });

    return workflows;
  }
  return [];
};

export const onCreateWorkflow = async (name: string, description: string) => {
  const { user } = await validateRequest();

  if (!user) {
    return { message: "Unauthorized" };
  }

  // Validate inputs
  if (!name || name.trim() === "") {
    return { message: "Workflow name is required" };
  }
  if (!description || description.trim() === "") {
    return { message: "Workflow description is required" };
  }

  //create new workflow
  const workflow = await db.workflow.create({
    data: {
      userId: Number(user.id),
      name: name.trim(),
      description: description.trim(),
    },
  });

  if (workflow) return { message: "workflow created" };
  return { message: "Oops! try again" };
};

export const onGetWorkflow = async (workflowId: string) => {
  return await db.workflow.findUnique({
    where: {
      id: workflowId,
    },
  });
};

export const onGetNodesEdges = async (flowId: string) => {
  const nodesEdges = await db.workflow.findUnique({
    where: {
      id: flowId,
    },
    select: {
      nodes: true,
      edges: true,
    },
  });
  if (nodesEdges?.nodes && nodesEdges?.edges) return nodesEdges;
};

export const onDeleteWorkflow = async (workflowId: string) => {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Verify ownership before deleting
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
      select: { userId: true },
    });

    if (!workflow) {
      return { success: false, message: "Workflow not found" };
    }

    if (workflow.userId !== Number(user.id)) {
      return { success: false, message: "Unauthorized" };
    }

    await db.workflow.delete({
      where: { id: workflowId },
    });

    return { success: true, message: "Workflow deleted" };
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return { success: false, message: "Failed to delete workflow" };
  }
};

export const onDuplicateWorkflow = async (workflowId: string) => {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return { success: false, message: "Workflow not found" };
    }

    if (workflow.userId !== Number(user.id)) {
      return { success: false, message: "Unauthorized" };
    }

    const duplicated = await db.workflow.create({
      data: {
        userId: workflow.userId,
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        nodes: workflow.nodes || undefined,
        edges: workflow.edges || undefined,
        discordTemplate: workflow.discordTemplate || undefined,
        notionTemplate: workflow.notionTemplate || undefined,
        slackTemplate: workflow.slackTemplate || undefined,
        slackChannels: workflow.slackChannels || undefined,
        notionDbId: workflow.notionDbId || undefined,
      },
    });

    return { success: true, message: "Workflow duplicated", data: duplicated };
  } catch (error) {
    console.error("Error duplicating workflow:", error);
    return { success: false, message: "Failed to duplicate workflow" };
  }
};

export const onCreateWorkflowLog = async (
  workflowId: string,
  status: string,
  message: string,
  results?: any,
) => {
  try {
    const log = await db.workflowLog.create({
      data: {
        workflowId,
        status,
        message,
        results,
      },
    });

    return log;
  } catch (error) {
    console.error("Error creating workflow log:", error);
  }
};

export const onGetWorkflowLogs = async (workflowId: string) => {
  try {
    const logs = await db.workflowLog.findMany({
      where: {
        workflowId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
    return logs;
  } catch (error) {
    console.error("Error fetching workflow logs:", error);
    return [];
  }
};

export const onSearchWorkflows = async (query: string) => {
  const { user } = await validateRequest();

  if (!user) return [];

  if (!query || query.trim().length === 0) return [];

  try {
    const workflows = await db.workflow.findMany({
      where: {
        userId: Number(user.id),
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: 5,
    });
    return workflows;
  } catch (error) {
    console.error("Error searching workflows:", error);
    return [];
  }
};
