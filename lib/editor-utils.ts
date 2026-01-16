import { ConnectionProviderProps } from "@/providers/connection-provider";
import { EditorCanvasCardType } from "./types";
import { EditorState } from "@/providers/editor-provider";
// import { getDiscordConnectionUrl } from "@/app/(main)/connections/_actions/discord-connection";
// import {
//   getNotionConnection,
//   getNotionDatabase,
// } from "@/app/(main)/connections/_actions/notion-connection";
// import {
//   getSlackConnection,
//   listBotChannels,
// } from "@/app/(main)/connections/_actions/slack-connection";
import { Option } from "@/components/ui/multiple-select";
import { listBotChannels } from "@/app/(main)/connections/_actions/slack-connection";
import { getDiscordConnectionUrl } from "@/app/(main)/connections/_actions/discord-connections";
import { getNotionDatabase } from "@/app/(main)/connections/_actions/notion-connection";
import { getNotionConnection } from "@/app/(main)/connections/_actions/notion-connection";
import { getSlackConnection } from "@/app/(main)/connections/_actions/slack-connection";
// type imports if needed or use any for raw DB types

export const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeType: EditorCanvasCardType["type"]
) => {
  event.dataTransfer.setData("application/reactflow", nodeType);
  event.dataTransfer.effectAllowed = "move";
};

export const onSlackContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }));
};

export const onDiscordContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }));
};

export const onContentChange = (
  nodeConnection: ConnectionProviderProps,
  nodeType: string,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  if (nodeType === "Slack") {
    onSlackContent(nodeConnection, event);
  } else if (nodeType === "Discord") {
    onDiscordContent(nodeConnection, event);
  } else if (nodeType === "Notion") {
    onNotionContent(nodeConnection, event);
  }
};

export const onAddTemplateSlack = (
  nodeConnection: ConnectionProviderProps,
  template: string
) => {
  nodeConnection.setSlackNode((prev: any) => ({
    ...prev,
    content: `${prev.content} ${template}`,
  }));
};

export const onAddTemplateDiscord = (
  nodeConnection: ConnectionProviderProps,
  template: string
) => {
  nodeConnection.setDiscordNode((prev: any) => ({
    ...prev,
    content: `${prev.content} ${template}`,
  }));
};

export const onAddTemplate = (
  nodeConnection: ConnectionProviderProps,
  title: string,
  template: string
) => {
  if (title === "Slack") {
    onAddTemplateSlack(nodeConnection, template);
  } else if (title === "Discord") {
    onAddTemplateDiscord(nodeConnection, template);
  }
};

import { getGoogleConnection } from "@/app/(main)/connections/_actions/google-connection";

export const onConnections = async (
  nodeConnection: ConnectionProviderProps,
  editorState: EditorState,
  googleFile: any
) => {
  if (editorState.editor.selectedNode.data.title == "Discord") {
    const connection = await getDiscordConnectionUrl();
    if (connection) {
      nodeConnection.setDiscordNode({
        webhookURL: connection.url,
        content: "",
        webhookName: connection.name,
        guildName: connection.guildName,
      });
    }
  }
  if (editorState.editor.selectedNode.data.title == "Notion") {
    const connection = await getNotionConnection();
    if (connection) {
      nodeConnection.setNotionNode({
        accessToken: connection.accessToken,
        databaseId: connection.databaseId,
        workspaceName: connection.workspaceName,
        content: {
          name: googleFile.name,
          kind: googleFile.kind,
          type: googleFile.mimeType,
        },
      });

      // Only fetch database if we have a valid databaseId
      const dbId = nodeConnection.notionNode.databaseId;
      if (dbId && dbId.length > 10) {
        const response = await getNotionDatabase(
          dbId,
          nodeConnection.notionNode.accessToken
        );
      }
    }
  }
  if (editorState.editor.selectedNode.data.title == "Slack") {
    const connection = (await getSlackConnection()) as any;
    if (connection) {
      nodeConnection.setSlackNode({
        appId: connection.metadata?.appId,
        authedUserId: connection.metadata?.authedUserId,
        authedUserToken: connection.metadata?.authedUserToken,
        slackAccessToken: connection.accessToken,
        botUserId: connection.metadata?.botUserId,
        teamId: connection.providerAccountId,
        teamName: connection.metadata?.teamName,
        userId: connection.userId,
        content: "",
      });
    }
  }
  if (editorState.editor.selectedNode.data.title == "Google Drive") {
    const connection = (await getGoogleConnection()) as any;
    if (connection) {
      nodeConnection.setGoogleNode([
        {
          ...connection,
          email: connection.metadata?.email,
        },
      ]);
    }
  }
};

export const fetchBotSlackChannels = async (
  token: string,
  setSlackChannels: (slackChannels: Option[]) => void
) => {
  await listBotChannels(token)?.then((channels) => setSlackChannels(channels));
};

export const onNotionContent = (
  nodeConnection: ConnectionProviderProps,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  nodeConnection.setNotionNode((prev: any) => ({
    ...prev,
    content: event.target.value,
  }));
};
