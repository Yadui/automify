"use server";
import { Option } from "@/components/ui/multiple-select";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Deduct 1 credit after a successful workflow run
export const deductCredit = async () => {
  try {
    const { user: authUser } = await validateRequest();
    if (!authUser) return { error: "Not authenticated" };

    const userId = Number(authUser.id);

    // Rate limit workflow runs: 30 per minute per user
    const rateLimitResult = checkRateLimit(
      userId.toString(),
      RATE_LIMITS.workflowRun,
    );
    if (!rateLimitResult.success) {
      return {
        error: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.`,
        rateLimited: true,
        resetIn: rateLimitResult.resetIn,
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true, tier: true },
    });

    if (!user) return { error: "User not found" };

    // Unlimited tier users don't consume credits
    if (user.tier === "Unlimited") {
      return { success: true, message: "Unlimited tier - no credits deducted" };
    }

    // No credits left
    if (user.credits <= 0) {
      return { error: "No credits remaining" };
    }

    // Deduct 1 credit
    await db.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    return { success: true, remaining: user.credits - 1 };
  } catch (error) {
    console.error("Error deducting credit:", error);
    return { error: "Failed to deduct credit" };
  }
};

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

  //create new workflow
  const workflow = await db.workflow.create({
    data: {
      userId: Number(user.id),
      name: name.trim(),
      description: description.trim(),
    },
  });

  if (workflow) return { message: "workflow created", id: workflow.id };
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

// Export workflow as JSON for backup/sharing
export const onExportWorkflow = async (workflowId: string) => {
  const { user } = await validateRequest();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const workflow = await db.workflow.findUnique({
      where: {
        id: workflowId,
        userId: Number(user.id),
      },
      select: {
        name: true,
        description: true,
        nodes: true,
        edges: true,
        flowPath: true,
        discordTemplate: true,
        slackTemplate: true,
        slackChannels: true,
        notionDbId: true,
        notionTemplate: true,
      },
    });

    if (!workflow) {
      return { error: "Workflow not found" };
    }

    // Create export object with metadata
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      workflow: {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
        flowPath: workflow.flowPath,
        templates: {
          discord: workflow.discordTemplate,
          slack: workflow.slackTemplate,
          slackChannels: workflow.slackChannels,
          notionDbId: workflow.notionDbId,
          notion: workflow.notionTemplate,
        },
      },
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error("Error exporting workflow:", error);
    return { error: "Failed to export workflow" };
  }
};

// Import workflow from JSON
export const onImportWorkflow = async (importData: any) => {
  const { user } = await validateRequest();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Validate import data structure
    if (!importData?.workflow) {
      return { error: "Invalid import file format" };
    }

    const { workflow: wf } = importData;

    // Create new workflow from imported data
    const newWorkflow = await db.workflow.create({
      data: {
        userId: Number(user.id),
        name: `${wf.name || "Imported Workflow"} (Imported)`,
        description: wf.description || "",
        nodes: wf.nodes || "[]",
        edges: wf.edges || "[]",
        flowPath: wf.flowPath || null,
        discordTemplate: wf.templates?.discord || null,
        slackTemplate: wf.templates?.slack || null,
        slackChannels: wf.templates?.slackChannels || [],
        notionDbId: wf.templates?.notionDbId || null,
        notionTemplate: wf.templates?.notion || null,
        publish: false,
      },
    });

    return {
      success: true,
      workflowId: newWorkflow.id,
      name: newWorkflow.name,
    };
  } catch (error) {
    console.error("Error importing workflow:", error);
    return { error: "Failed to import workflow" };
  }
};

// Create workflow from template
export const onCreateFromTemplate = async (templateId: string) => {
  const { user } = await validateRequest();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const templates: Record<string, any> = {
    "email-notification": {
      name: "Email Notification",
      description: "Send email notifications when triggered",
      nodes: JSON.stringify([
        {
          id: "trigger-1",
          type: "Trigger",
          position: { x: 250, y: 100 },
          data: {
            title: "Trigger",
            description: "Start the workflow",
            type: "Trigger",
            configStatus: "active",
            metadata: { triggerType: "manual" },
          },
        },
        {
          id: "gmail-1",
          type: "Email",
          position: { x: 250, y: 250 },
          data: {
            title: "Send Email",
            description: "Send notification email",
            type: "Email",
            configStatus: "pending",
            metadata: {},
          },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1", source: "trigger-1", target: "gmail-1" },
      ]),
    },
    "slack-notification": {
      name: "Slack Notification",
      description: "Post messages to Slack when triggered",
      nodes: JSON.stringify([
        {
          id: "trigger-1",
          type: "Trigger",
          position: { x: 250, y: 100 },
          data: {
            title: "Trigger",
            description: "Start the workflow",
            type: "Trigger",
            configStatus: "active",
            metadata: { triggerType: "manual" },
          },
        },
        {
          id: "slack-1",
          type: "Slack",
          position: { x: 250, y: 250 },
          data: {
            title: "Post to Slack",
            description: "Send Slack message",
            type: "Slack",
            configStatus: "pending",
            metadata: {},
          },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1", source: "trigger-1", target: "slack-1" },
      ]),
    },
    "api-integration": {
      name: "API Integration",
      description: "Make HTTP requests to external APIs",
      nodes: JSON.stringify([
        {
          id: "trigger-1",
          type: "Trigger",
          position: { x: 250, y: 100 },
          data: {
            title: "Trigger",
            description: "Start the workflow",
            type: "Trigger",
            configStatus: "active",
            metadata: { triggerType: "manual" },
          },
        },
        {
          id: "http-1",
          type: "HTTP Request",
          position: { x: 250, y: 250 },
          data: {
            title: "HTTP Request",
            description: "Call external API",
            type: "HTTP Request",
            configStatus: "pending",
            metadata: { method: "GET" },
          },
        },
        {
          id: "condition-1",
          type: "Condition",
          position: { x: 250, y: 400 },
          data: {
            title: "Check Response",
            description: "Evaluate API response",
            type: "Condition",
            configStatus: "pending",
            metadata: {},
          },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1", source: "trigger-1", target: "http-1" },
        { id: "e2", source: "http-1", target: "condition-1" },
      ]),
    },
    "drive-sync": {
      name: "Google Drive Sync",
      description: "React to Google Drive file changes",
      nodes: JSON.stringify([
        {
          id: "drive-1",
          type: "Google Drive",
          position: { x: 250, y: 100 },
          data: {
            title: "Google Drive",
            description: "Watch for file changes",
            type: "Google Drive",
            configStatus: "pending",
            metadata: {},
          },
        },
        {
          id: "wait-1",
          type: "Wait",
          position: { x: 250, y: 250 },
          data: {
            title: "Wait",
            description: "Delay processing",
            type: "Wait",
            configStatus: "pending",
            metadata: { type: "duration", value: 5, unit: "seconds" },
          },
        },
        {
          id: "discord-1",
          type: "Discord",
          position: { x: 250, y: 400 },
          data: {
            title: "Discord",
            description: "Send notification",
            type: "Discord",
            configStatus: "pending",
            metadata: {},
          },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1", source: "drive-1", target: "wait-1" },
        { id: "e2", source: "wait-1", target: "discord-1" },
      ]),
    },
  };

  const template = templates[templateId];
  if (!template) {
    return { error: "Template not found" };
  }

  try {
    const newWorkflow = await db.workflow.create({
      data: {
        userId: Number(user.id),
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
        publish: false,
      },
    });

    return {
      success: true,
      workflowId: newWorkflow.id,
      name: newWorkflow.name,
    };
  } catch (error) {
    console.error("Error creating workflow from template:", error);
    return { error: "Failed to create workflow from template" };
  }
};

// Get available templates
export const getWorkflowTemplates = async () => {
  return [
    {
      id: "email-notification",
      name: "Email Notification",
      description: "Send email notifications when triggered",
      icon: "Mail",
      nodes: ["Trigger", "Email"],
    },
    {
      id: "slack-notification",
      name: "Slack Notification",
      description: "Post messages to Slack when triggered",
      icon: "MessageSquare",
      nodes: ["Trigger", "Slack"],
    },
    {
      id: "api-integration",
      name: "API Integration",
      description: "Make HTTP requests with conditional logic",
      icon: "Globe",
      nodes: ["Trigger", "HTTP Request", "Condition"],
    },
    {
      id: "drive-sync",
      name: "Google Drive Sync",
      description: "React to Google Drive changes",
      icon: "HardDrive",
      nodes: ["Google Drive", "Wait", "Discord"],
    },
  ];
};
