"use server";
import { Option } from "@/components/ui/multiple-select";
import db from "@/lib/db";
import { getAppUser, type AppAuthUser } from "@/lib/app-auth";
import { WorkflowFormSchema } from "@/lib/types";
import { z } from "zod";

const WorkflowNameSchema = z.object({
  id: z.string().min(1, "Workflow id is required"),
  name: z.string().trim().min(1, "Name is required"),
});

const normalizeWorkflowInput = (input: unknown) => {
  if (
    input &&
    typeof input === "object" &&
    "get" in input &&
    typeof (input as { get?: unknown }).get === "function"
  ) {
    const formData = input as FormData;
    return {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
    };
  }

  return input;
};

const resolveWorkflowOwnerId = async (user: AppAuthUser) => {
  const existingById = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { clerkId: true },
  });

  if (existingById) return existingById.clerkId;

  const existingByEmail = await db.user.findUnique({
    where: { email: user.email },
    select: { clerkId: true },
  });

  if (existingByEmail) return existingByEmail.clerkId;

  const created = await db.user.create({
    data: {
      clerkId: user.id,
      email: user.email,
      name: user.name,
      tier: "Free",
      credits: "10",
    },
    select: { clerkId: true },
  });

  return created.clerkId;
};

export const getGoogleListener = async () => {
  const user = await getAppUser();

  if (user) {
    const listener = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        googleResourceId: true,
      },
    });

    if (listener) return listener;
  }
};

export const onFlowPublish = async (workflowId: string, state: boolean) => {
  const user = await getAppUser();
  if (!user) return "Failed to update the workflow state";

  const ownerId = await resolveWorkflowOwnerId(user);
  const published = await db.workflows.updateMany({
    where: {
      id: workflowId,
      userId: ownerId,
    },
    data: {
      publish: state,
    },
  });

  if (!published.count) return "Failed to update the workflow state";
  if (state) return "Workflow published";
  return "Workflow unpublished";
};

export const onCreateNodeTemplate = async (
  content: string,
  type: string,
  workflowId: string,
  channels?: Option[],
  accessToken?: string,
  notionDbId?: string
) => {
  if (type === "Discord") {
    const response = await db.workflows.update({
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
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        slackTemplate: content,
        slackAccessToken: accessToken,
      },
    });

    if (response) {
      const channelList = await db.workflows.findUnique({
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
          (channel) => channel !== channels![0].value
        );

        NonDuplicated!
          .map((channel) => channel)
          .forEach(async (channel) => {
            await db.workflows.update({
              where: {
                id: workflowId,
              },
              data: {
                slackChannels: {
                  push: channel,
                },
              },
            });
          });

        return "Slack template saved";
      }
      channels!
        .map((channel) => channel.value)
        .forEach(async (channel) => {
          await db.workflows.update({
            where: {
              id: workflowId,
            },
            data: {
              slackChannels: {
                push: channel,
              },
            },
          });
        });
      return "Slack template saved";
    }
  }

  if (type === "Notion") {
    const response = await db.workflows.update({
      where: {
        id: workflowId,
      },
      data: {
        notionTemplate: content,
        notionAccessToken: accessToken,
        notionDbId: notionDbId,
      },
    });

    if (response) return "Notion template saved";
  }
};

export const onGetWorkflows = async () => {
  const user = await getAppUser();
  if (user) {
    const ownerId = await resolveWorkflowOwnerId(user);
    const workflow = await db.workflows.findMany({
      where: {
        userId: ownerId,
      },
    });

    if (workflow) return workflow;
  }
};

export const onCreateWorkflow = async (input: unknown) => {
  const user = await getAppUser();

  const parsed = WorkflowFormSchema.safeParse(normalizeWorkflowInput(input));
  if (!parsed.success) {
    return { ok: false, message: "Name and description are required" };
  }

  if (user) {
    const ownerId = await resolveWorkflowOwnerId(user);
    const { name, description } = parsed.data;
    //create new workflow
    try {
      const workflow = await db.workflows.create({
        data: {
          userId: ownerId,
          name,
          description,
        },
      });

      if (workflow) return { ok: true, message: "workflow created" };
    } catch {
      return { ok: false, message: "Unable to create workflow" };
    }

    return { ok: false, message: "Oops! try again" };
  }

  return { ok: false, message: "Sign in to create a workflow" };
};

export const onUpdateWorkflowName = async (input: unknown) => {
  const user = await getAppUser();
  if (!user) return { ok: false, message: "Sign in to update a workflow" };

  const parsed = WorkflowNameSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Workflow name is required" };
  const ownerId = await resolveWorkflowOwnerId(user);

  const updated = await db.workflows.updateMany({
    where: {
      id: parsed.data.id,
      userId: ownerId,
    },
    data: {
      name: parsed.data.name,
    },
  });

  if (!updated.count) return { ok: false, message: "Workflow not found" };
  return { ok: true, message: "Workflow name updated" };
};

export const onDeleteWorkflow = async (workflowId: string) => {
  const user = await getAppUser();
  if (!user) return { ok: false, message: "Sign in to delete a workflow" };

  const parsed = z.string().min(1).safeParse(workflowId);
  if (!parsed.success) return { ok: false, message: "Workflow id is required" };
  const ownerId = await resolveWorkflowOwnerId(user);

  const [, deleted] = await db.$transaction([
    db.connections.deleteMany({
      where: {
        workflowId: parsed.data,
        userId: ownerId,
      },
    }),
    db.workflows.deleteMany({
      where: {
        id: parsed.data,
        userId: ownerId,
      },
    }),
  ]);

  if (!deleted.count) return { ok: false, message: "Workflow not found" };
  return { ok: true, message: "Workflow deleted" };
};

export const onGetNodesEdges = async (flowId: string) => {
  const nodesEdges = await db.workflows.findUnique({
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
