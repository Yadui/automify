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

  const response = await notion.search({
    filter: {
      property: "object",
      value: "database",
    },
    sort: {
      direction: "ascending",
      timestamp: "last_edited_time",
    },
  });

  // Format the response for the <MultipleSelector> component
  return response.results.map((database) => ({
    value: database.id,
    label:
      "title" in database
        ? database.title[0]?.plain_text || "Untitled Database"
        : "Untitled Database",
  }));
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
