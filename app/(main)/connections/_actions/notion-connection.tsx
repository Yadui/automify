"use server";

import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import {
  connectorSettingsJsonSchema,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import { getAppUser } from "@/lib/app-auth";
import { Client } from "@notionhq/client";
import crypto from "crypto"; // Import Node.js crypto library

// --- Encryption Setup ---
// IMPORTANT: Add a 32-character (256-bit) random string to your .env.local file
// Example: NOTION_ENCRYPTION_KEY=your_super_secret_random_32_character_key
const ENCRYPTION_KEY = process.env.NOTION_ENCRYPTION_KEY!;
const IV_LENGTH = 16; // For AES, this is always 16

// ENCRYPTION FUNCTION: To securely store the token
function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// DECRYPTION FUNCTION: To use the token for API calls
function decrypt(text: string) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
// --- End Encryption Setup ---

export const onNotionConnect = async (
  access_token: string,
  workspace_id: string,
  workspace_icon: string,
  workspace_name: string,
  database_id: string,
  id: string
) => {
  "use server";
  const connectorType: ConnectorType = "Notion";
  if (access_token) {
    const encryptedToken = encrypt(access_token);
    const settings = connectorSettingsJsonSchema.parse({
      accessToken: encryptedToken,
      workspaceId: workspace_id,
      workspaceIcon: workspace_icon,
      workspaceName: workspace_name,
      databaseId: database_id,
    }) satisfies ConnectorSettingsInput;
    const prismaSettings = settings as Prisma.InputJsonObject;

    const userConnection = await db.notion.findFirst({
      where: { userId: id },
    });

    if (userConnection) {
      // If the user reconnects, update their Notion details
      await db.notion.update({
        where: { userId: id },
        data: {
          accessToken: encryptedToken,
          workspaceId: workspace_id,
          workspaceIcon: workspace_icon,
          workspaceName: workspace_name,
          databaseId: database_id,
          // AND ensure the link in the Connections table exists.
          // `upsert` will create it if it's missing, or do nothing if it exists.
          connections: {
            upsert: {
              // CORRECTED "where" CLAUSE FOR THE COMPOUND KEY
              where: {
                userId_type: {
                  userId: id,
                  type: connectorType,
                },
              },
              create: { userId: id, type: connectorType, settings: prismaSettings },
              update: { settings: prismaSettings },
            },
          },
        },
      });
    } else {
      // The create logic is already correct
      await db.notion.create({
        data: {
          userId: id,
          accessToken: encryptedToken,
          workspaceId: workspace_id,
          workspaceIcon: workspace_icon,
          workspaceName: workspace_name,
          databaseId: database_id,
          connections: {
            create: {
              userId: id,
              type: connectorType,
              settings: prismaSettings,
            },
          },
        },
      });
    }
  }
};

export const getNotionConnection = async () => {
  const user = await getAppUser();
  if (user) {
    const connection = await db.notion.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (connection) {
      return connection;
    }
  }
};

export const getNotionDatabases = async () => {
  const user = await getAppUser();
  if (!user) return [];

  const connection = await db.notion.findFirst({
    where: { userId: user.id },
  });

  if (!connection) return [];

  const decryptedToken = decrypt(connection.accessToken);
  const notion = new Client({ auth: decryptedToken });

  // Notion API v5 (2025-09-03) no longer returns DatabaseObjectResponse from
  // notion.search(). Legacy databases (object: "database") only appear as
  // child_database blocks inside their parent pages.
  //
  // Strategy:
  //   1. Fetch every page the integration can access.
  //   2. For each page, list its top-level block children in parallel.
  //   3. Collect any block with type === "child_database".
  //   4. Deduplicate by block ID (the block ID == the database ID).

  // Step 1 — get all accessible pages
  const searchResp = await notion.search({
    filter: { property: "object", value: "page" },
    sort: { direction: "descending", timestamp: "last_edited_time" },
    page_size: 50,
  });

  const pageIds = searchResp.results.map((p) => p.id);
  if (pageIds.length === 0) return [];

  // Step 2 — list block children for every page, in parallel
  const childrenResults = await Promise.allSettled(
    pageIds.map((pageId) =>
      notion.blocks.children.list({ block_id: pageId, page_size: 100 })
    )
  );

  // Step 3 — collect child_database blocks, deduplicate
  const seen = new Set<string>();
  const databases: { value: string; label: string }[] = [];

  for (const result of childrenResults) {
    if (result.status !== "fulfilled") continue;
    for (const block of result.value.results as any[]) {
      if (block.type === "child_database" && !seen.has(block.id)) {
        seen.add(block.id);
        databases.push({
          value: block.id,
          label: block.child_database?.title || "Untitled Database",
        });
      }
    }
  }

  return databases;
};

export const getNotionDatabase = async (
  databaseId: string,
  accessToken: string // This will be the ENCRYPTED token from the DB
) => {
  // Decrypt the token before using it
  const decryptedToken = decrypt(accessToken);
  const notion = new Client({
    auth: decryptedToken,
  });
  const response = await notion.databases.retrieve({ database_id: databaseId });
  return response;
};

export const onCreateNewPageInDatabase = async (
  databaseId: string,
  accessToken: string, // This will be the ENCRYPTED token from the DB
  content: string
) => {
  // Decrypt the token before using it
  const decryptedToken = decrypt(accessToken);
  const notion = new Client({
    auth: decryptedToken,
  });

  console.log(databaseId);
  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties: {
      // Assumes your database has a 'Title' property named 'name'
      Name: {
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
  if (response) {
    return response;
  }
};

// Returns all Notion pages the integration can access — used as parent candidates
// when the user wants to create a new database.
export const getNotionPages = async (): Promise<{ id: string; title: string }[]> => {
  const user = await getAppUser();
  if (!user) return [];

  const connection = await db.notion.findFirst({ where: { userId: user.id } });
  if (!connection) return [];

  const decryptedToken = decrypt(connection.accessToken);
  const notion = new Client({ auth: decryptedToken });

  const response = await notion.search({
    filter: { property: "object", value: "page" },
    sort: { direction: "ascending", timestamp: "last_edited_time" },
    page_size: 50,
  });

  return response.results.map((page: any) => {
    let title = "Untitled Page";
    if ("properties" in page) {
      const titleProp = Object.values(page.properties as Record<string, any>).find(
        (p: any) => p.type === "title"
      ) as any;
      if (titleProp?.title?.[0]?.plain_text) {
        title = titleProp.title[0].plain_text;
      }
    }
    return { id: page.id, title };
  });
};

// Creates a new Notion database inside the given parent page and returns
// a descriptor compatible with the wizard's `databases` state.
export const createNotionDatabase = async (
  parentPageId: string,
  title: string
): Promise<{ id: string; title: string; icon: string } | null> => {
  const user = await getAppUser();
  if (!user) return null;

  const connection = await db.notion.findFirst({ where: { userId: user.id } });
  if (!connection) return null;

  const decryptedToken = decrypt(connection.accessToken);
  const notion = new Client({ auth: decryptedToken });

  const response = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: title } }],
    // Note: 'properties' was removed from CreateDatabaseParameters in SDK v5.
    // The database will be created with no schema; columns can be added in Notion.
  });

  return {
    id: response.id,
    title: "title" in response ? ((response.title[0] as any)?.plain_text ?? title) : title,
    icon: "📋",
  };
};

// Moves a Notion page to the workspace trash after a test run.
// Uses the user's stored (encrypted) token so the client never touches it.
export const deleteNotionTestPage = async (pageId: string): Promise<{ ok: boolean; error?: string }> => {
  const user = await getAppUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const connection = await db.notion.findFirst({ where: { userId: user.id } });
  if (!connection) return { ok: false, error: "Notion not connected" };

  try {
    const decryptedToken = decrypt(connection.accessToken);
    const notion = new Client({ auth: decryptedToken });
    await notion.pages.update({ page_id: pageId, in_trash: true });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to trash page" };
  }
};
