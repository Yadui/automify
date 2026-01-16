"use server";
import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { Client } from "@notionhq/client";

export const onNotionConnect = async (
  access_token: string,
  workspace_id: string,
  workspace_icon: string,
  workspace_name: string,
  database_id: string,
  userId: number
) => {
  if (access_token) {
    await db.connection.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId,
          provider: "notion",
          providerAccountId: workspace_id,
        },
      },
      update: {
        accessToken: access_token,
        metadata: {
          workspaceIcon: workspace_icon,
          workspaceName: workspace_name,
          databaseId: database_id,
        },
        status: "active",
      },
      create: {
        userId,
        provider: "notion",
        providerAccountId: workspace_id,
        accessToken: access_token,
        metadata: {
          workspaceIcon: workspace_icon,
          workspaceName: workspace_name,
          databaseId: database_id,
        },
        status: "active",
      },
    });
  }
};

export const getNotionConnection = async () => {
  const { user } = await validateRequest();
  if (user) {
    const connection = await db.connection.findFirst({
      where: {
        userId: Number(user.id),
        provider: "notion",
      },
    });
    if (connection) {
      return {
        ...connection,
        workspaceIcon: (connection.metadata as any)?.workspaceIcon,
        workspaceName: (connection.metadata as any)?.workspaceName,
        databaseId: (connection.metadata as any)?.databaseId,
      };
    }
  }
  return null;
};

export const getNotionDatabase = async (
  databaseId: string,
  accessToken: string
) => {
  const notion = new Client({
    auth: accessToken,
  });
  const response = await notion.databases.retrieve({ database_id: databaseId });
  return response;
};

export const onCreateNewPageInDatabase = async (
  databaseId: string,
  accessToken: string,
  content: string
) => {
  const notion = new Client({
    auth: accessToken,
  });

  // First, get the database schema to find the title property name
  const database = (await notion.databases.retrieve({
    database_id: databaseId,
  })) as any;

  // Find the property that is of type "title"
  let titlePropertyName = "Name"; // default fallback
  for (const [propName, propValue] of Object.entries(database.properties)) {
    if ((propValue as any).type === "title") {
      titlePropertyName = propName;
      break;
    }
  }

  // Create the page with the correct title property name
  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties: {
      [titlePropertyName]: {
        title: [
          {
            text: {
              content: content,
            },
          },
        ],
      },
    },
  });
  return response;
};

export const getNotionDatabases = async (accessToken: string) => {
  const notion = new Client({
    auth: accessToken,
  });

  try {
    const response = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
      page_size: 50,
    });

    return {
      databases: response.results.map((db: any) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || "Untitled Database",
        icon: db.icon?.emoji || db.icon?.external?.url || "📊",
      })),
    };
  } catch (error: any) {
    console.error("Error fetching Notion databases:", error);
    return { databases: [], error: error.message };
  }
};
