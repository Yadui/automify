"use server";
import { Option } from "@/components/ui/multiple-select";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Deduct 1 credit after a successful workflow run
export const deductCredit = async () => {
  try {
    const user = await getAppUser();
    if (!user) return { error: "Not authenticated" };

    // Rate limit workflow runs: 30 per minute per user
    const rateLimitResult = checkRateLimit(user.id, RATE_LIMITS.workflowRun);
    if (!rateLimitResult.success) {
      return {
        error: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.`,
        rateLimited: true,
        resetIn: rateLimitResult.resetIn,
      };
    }

    const dbUser = await db.user.findUnique({
      where: { appId: user.id },
      select: { credits: true, tier: true },
    });

    if (!dbUser) return { error: "User not found" };

    // Unlimited tier users don't consume credits
    if (dbUser.tier === "Unlimited") {
      return { success: true, message: "Unlimited tier - no credits deducted" };
    }

    const currentCredits = parseInt(dbUser.credits ?? "0", 10);

    // No credits left
    if (currentCredits <= 0) {
      return { error: "No credits remaining" };
    }

    await db.user.update({
      where: { appId: user.id },
      data: { credits: String(currentCredits - 1) },
    });

    return { success: true, remaining: currentCredits - 1 };
  } catch (error) {
    console.error("Error deducting credit:", error);
    return { error: "Failed to deduct credit" };
  }
};

export const getGoogleListener = async () => {
  const user = await getAppUser();

  if (user) {
    const listener = await db.user.findUnique({
      where: { appId: user.id },
      select: { googleResourceId: true },
    });

    if (listener) return listener;
  }
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  const published = await db.workflows.update({
    where: { id: workflowId },
    data: { publish: state },
  });

  if (published.publish) return "Workflow published";
  return "Workflow unpublished";
};

export const onCreateNodeTemplate = async (
  content: string,
  type: string,
  workflowId: string,
  channels?: Option[],
  accessToken?: string,
  notionDbId?: string,
) => {
  if (type === "Discord") {
    const response = await db.workflows.update({
      where: { id: workflowId },
      data: { discordTemplate: content },
    });

    if (response) return "Discord template saved";
  }

  if (type === "Slack") {
    const response = await db.workflows.update({
      where: { id: workflowId },
      data: { slackTemplate: content },
    });

    if (response) {
      const channelList = await db.workflows.findUnique({
        where: { id: workflowId },
        select: { slackChannels: true },
      });

      if (channelList) {
        const nonDuplicated = channelList.slackChannels.filter(
          (channel) =>
            channel !==
            (channels && channels.length > 0 ? channels[0].value : ""),
        );

        await Promise.all(
          nonDuplicated.map((channel) =>
            db.workflows.update({
              where: { id: workflowId },
              data: { slackChannels: { push: channel } },
            }),
          ),
        );
        return "Slack template saved";
      }

      if (channels && channels.length > 0) {
        await Promise.all(
          channels.map((channel) =>
            db.workflows.update({
              where: { id: workflowId },
              data: { slackChannels: { push: channel.value } },
            }),
          ),
        );
      }
      return "Slack template saved";
    }
  }

  if (type === "Notion") {
    const response = await db.workflows.update({
      where: { id: workflowId },
      data: {
        notionTemplate: content,
        notionDbId: notionDbId,
      },
    });

    if (response) return "Notion template saved";
  }
};

export const onGetWorkflows = async () => {
  const user = await getAppUser();
  if (!user) return [];

  const workflows = await db.workflows.findMany({
    where: { userId: user.id },
  });

  return workflows;
};

export const onCreateWorkflow = async ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
  const user = await getAppUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  if (!name || name.trim() === "") {
    return { ok: false, message: "Workflow name is required" };
  }

  const workflow = await db.workflows.create({
    data: {
      userId: user.id,
      name: name.trim(),
      description: description.trim(),
    },
  });

  if (workflow) return { ok: true, message: "Workflow created", id: workflow.id };
  return { ok: false, message: "Oops! try again" };
};

export const onGetWorkflow = async (workflowId: string) => {
  return await db.workflows.findUnique({
    where: { id: workflowId },
  });
};

export const onGetNodesEdges = async (flowId: string) => {
  const nodesEdges = await db.workflows.findUnique({
    where: { id: flowId },
    select: { nodes: true, edges: true },
  });
  if (nodesEdges?.nodes && nodesEdges?.edges) return nodesEdges;
};

export const onUpdateWorkflowName = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const user = await getAppUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "Workflow name is required" };
  }

  try {
    const workflow = await db.workflows.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!workflow) {
      return { ok: false, message: "Workflow not found" };
    }

    if (workflow.userId !== user.id) {
      return { ok: false, message: "Unauthorized" };
    }

    await db.workflows.update({
      where: { id },
      data: { name: trimmed },
    });

    return { ok: true, message: "Workflow renamed" };
  } catch (error) {
    console.error("Error renaming workflow:", error);
    return { ok: false, message: "Failed to rename workflow" };
  }
};

export const onDeleteWorkflow = async (workflowId: string) => {
  const user = await getAppUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  try {
    const workflow = await db.workflows.findUnique({
      where: { id: workflowId },
      select: { userId: true },
    });

    if (!workflow) {
      return { ok: false, message: "Workflow not found" };
    }

    if (workflow.userId !== user.id) {
      return { ok: false, message: "Unauthorized" };
    }

    await db.workflows.delete({
      where: { id: workflowId },
    });

    return { ok: true, message: "Workflow deleted" };
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return { ok: false, message: "Failed to delete workflow" };
  }
};

export const onDuplicateWorkflow = async (workflowId: string) => {
  const user = await getAppUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const workflow = await db.workflows.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return { success: false, message: "Workflow not found" };
    }

    if (workflow.userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    const duplicated = await db.workflows.create({
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
  durationMs?: number,
) => {
  try {
    const user = await getAppUser();
    if (!user) return;
    await db.workflowLog.create({
      data: {
        workflowId,
        userId: user.id,
        status,
        message,
        results: results ?? [],
        durationMs: durationMs ?? null,
      },
    });
  } catch (error) {
    console.error("Error creating workflow log:", error);
  }
};

export const onGetWorkflowLogs = async (workflowId: string) => {
  try {
    const user = await getAppUser();
    if (!user) return [];
    return await db.workflowLog.findMany({
      where: { workflowId, userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("Error fetching workflow logs:", error);
    return [];
  }
};

export const onSearchWorkflows = async (query: string) => {
  const user = await getAppUser();

  if (!user) return [];
  if (!query || query.trim().length === 0) return [];

  try {
    const workflows = await db.workflows.findMany({
      where: {
        userId: user.id,
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

export const onExportWorkflow = async (workflowId: string) => {
  const user = await getAppUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const workflow = await db.workflows.findUnique({
      where: {
        id: workflowId,
        userId: user.id,
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

export const onImportWorkflow = async (importData: any) => {
  const user = await getAppUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    if (!importData?.workflow) {
      return { error: "Invalid import file format" };
    }

    const { workflow: wf } = importData;

    const newWorkflow = await db.workflows.create({
      data: {
        userId: user.id,
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

export const onCreateFromTemplate = async (templateId: string) => {
  const user = await getAppUser();

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
      edges: JSON.stringify([{ id: "e1", source: "trigger-1", target: "gmail-1" }]),
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
      edges: JSON.stringify([{ id: "e1", source: "trigger-1", target: "slack-1" }]),
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
    "github-to-notion": {
      name: "GitHub Issues → Notion",
      description: "Log new GitHub issues into a Notion database automatically",
      nodes: JSON.stringify([
        {
          id: "github-1",
          type: "GitHub",
          position: { x: 250, y: 100 },
          data: {
            title: "GitHub",
            description: "Watch for new issues",
            type: "GitHub",
            configStatus: "pending",
            metadata: { event: "new_issue" },
          },
        },
        {
          id: "notion-1",
          type: "Notion",
          position: { x: 250, y: 260 },
          data: {
            title: "Notion",
            description: "Create a page for each issue",
            type: "Notion",
            configStatus: "pending",
            metadata: {},
          },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1", source: "github-1", target: "notion-1" },
      ]),
    },
    "conditional-notify": {
      name: "Conditional Route",
      description: "Evaluate a condition and route to Slack or email",
      nodes: JSON.stringify([
        {
          id: "trigger-1",
          type: "Trigger",
          position: { x: 250, y: 80 },
          data: {
            title: "Trigger",
            description: "Start the workflow",
            type: "Trigger",
            configStatus: "active",
            metadata: { triggerType: "manual" },
          },
        },
        {
          id: "condition-1",
          type: "Condition",
          position: { x: 250, y: 240 },
          data: {
            title: "Condition",
            description: "Evaluate data and branch",
            type: "Condition",
            configStatus: "pending",
            metadata: {},
          },
        },
        {
          id: "slack-1",
          type: "Slack",
          position: { x: 80, y: 420 },
          data: {
            title: "Slack",
            description: "True branch — notify via Slack",
            type: "Slack",
            configStatus: "pending",
            metadata: {},
          },
        },
        {
          id: "email-1",
          type: "Email",
          position: { x: 420, y: 420 },
          data: {
            title: "Email",
            description: "False branch — send email",
            type: "Email",
            configStatus: "pending",
            metadata: {},
          },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1", source: "trigger-1", target: "condition-1" },
        { id: "e2", source: "condition-1", target: "slack-1", sourceHandle: "true" },
        { id: "e3", source: "condition-1", target: "email-1", sourceHandle: "false" },
      ]),
    },
  };

  const template = templates[templateId];
  if (!template) {
    return { error: "Template not found" };
  }

  try {
    const newWorkflow = await db.workflows.create({
      data: {
        userId: user.id,
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

export const getWorkflowTemplates = async () => {
  return [
    {
      id: "email-notification",
      name: "Email Notification",
      description: "Trigger a custom email when an event fires.",
      connectors: ["Trigger", "Email"],
      category: "Notification",
    },
    {
      id: "slack-notification",
      name: "Slack Alert",
      description: "Post a message to Slack when your workflow runs.",
      connectors: ["Trigger", "Slack"],
      category: "Notification",
    },
    {
      id: "drive-sync",
      name: "Drive → Discord",
      description: "Watch Google Drive for changes and post a Discord alert.",
      connectors: ["Google Drive", "Discord"],
      category: "Sync",
    },
    {
      id: "api-integration",
      name: "API Integration",
      description: "Call an external API and branch on the response.",
      connectors: ["Custom Webhook", "Condition"],
      category: "Developer",
    },
    {
      id: "github-to-notion",
      name: "GitHub → Notion",
      description: "Log new GitHub issues directly into a Notion database.",
      connectors: ["GitHub", "Notion"],
      category: "Productivity",
    },
    {
      id: "conditional-notify",
      name: "Conditional Route",
      description: "Evaluate a condition and route to Slack or email.",
      connectors: ["Condition", "Slack", "Email"],
      category: "Logic",
    },
  ];
};
