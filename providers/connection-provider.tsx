"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import { getAllConnections } from "@/app/(main)/connections/_actions/get-connections"; // We'll create this action next
import type { ConnectorRelationInput, ConnectorSettingsInput } from "@/lib/connectors";

export type NodeConnectionState = {
  settings?: ConnectorSettingsInput;
  relations?: ConnectorRelationInput[];
};

// 1. Define specific types for your connection nodes
type DiscordNode = NodeConnectionState & {
  webhookURL: string;
  content: string;
  webhookName: string;
  guildName: string;
  channelId: string;
};
type NotionNode = NodeConnectionState & {
  accessToken: string;
  databaseId: string;
  workspaceName: string;
  content: string | Record<string, unknown>;
};
type SlackNode = NodeConnectionState & {
  appId: string;
  authedUserId: string;
  authedUserToken: string;
  slackAccessToken: string;
  botUserId: string;
  teamId: string;
  teamName: string;
  content: string;
};

type TrelloNode = NodeConnectionState & {
  apiKey?: string;
  token?: string;
  workspaceId?: string;
};
type GitHubNode = NodeConnectionState & {
  accessToken?: string;
  installationId?: string;
};

type GoogleNode = Record<string, unknown> & NodeConnectionState;
type GenericConnectorNode = Record<string, unknown> & NodeConnectionState;
type WorkflowTemplate = { discord?: string; notion?: string; slack?: string };

export type ConnectionProviderProps = {
  discordNode: DiscordNode;
  setDiscordNode: React.Dispatch<React.SetStateAction<DiscordNode>>;
  googleNode: GoogleNode;
  setGoogleNode: React.Dispatch<React.SetStateAction<GoogleNode>>;
  notionNode: NotionNode;
  setNotionNode: React.Dispatch<React.SetStateAction<NotionNode>>;
  slackNode: SlackNode;
  setSlackNode: React.Dispatch<React.SetStateAction<SlackNode>>;
  trelloNode: TrelloNode;
  setTrelloNode: React.Dispatch<React.SetStateAction<TrelloNode>>;
  githubNode: GitHubNode;
  setGitHubNode: React.Dispatch<React.SetStateAction<GitHubNode>>;
  workflowTemplate: WorkflowTemplate;
  setWorkFlowTemplate: React.Dispatch<React.SetStateAction<WorkflowTemplate>>;
  isLoading: boolean;
  hasLoaded: boolean;
  loadConnections: () => Promise<void>;
};

const ConnectionsContext = createContext<ConnectionProviderProps | null>(null);

export const ConnectionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [discordNode, setDiscordNode] = useState<DiscordNode>({
    webhookURL: "",
    content: "",
    webhookName: "",
    guildName: "",
    channelId: "",
  });
  const [googleNode, setGoogleNode] = useState<GoogleNode>({});
  const [notionNode, setNotionNode] = useState<NotionNode>({
    accessToken: "",
    databaseId: "",
    workspaceName: "",
    content: "",
  });
  const [slackNode, setSlackNode] = useState<SlackNode>({
    appId: "",
    authedUserId: "",
    authedUserToken: "",
    slackAccessToken: "",
    botUserId: "",
    teamId: "",
    teamName: "",
    content: "",
  });
  const [trelloNode, setTrelloNode] = useState<TrelloNode>({});
  const [githubNode, setGitHubNode] = useState<GitHubNode>({});
  const [workflowTemplate, setWorkFlowTemplate] = useState<WorkflowTemplate>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadConnections = useCallback(async () => {
    if (isLoading || hasLoaded) return;

    setIsLoading(true);
    try {
      const connections = await getAllConnections();
      const discord = connections.discord as Partial<DiscordNode> & {
        url?: string;
        name?: string;
      };
      if (connections.discord) {
        setDiscordNode({
          webhookURL: discord.webhookURL ?? discord.url ?? "",
          content: discord.content ?? "",
          webhookName: discord.webhookName ?? discord.name ?? "",
          guildName: discord.guildName ?? "",
          channelId: discord.channelId ?? "",
        });
      }
      if (connections.notion) setNotionNode(connections.notion as NotionNode);
      if (connections.slack) setSlackNode(connections.slack as SlackNode);
      if (connections.google) setGoogleNode(connections.google as GoogleNode);
      if (connections.byType?.Trello) setTrelloNode(connections.byType.Trello as TrelloNode);
      if (connections.byType?.GitHub) setGitHubNode(connections.byType.GitHub as GitHubNode);
      setHasLoaded(true);
    } catch (error) {
      console.error("Failed to fetch connections", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasLoaded, isLoading]);

  const values = {
    discordNode,
    setDiscordNode,
    googleNode,
    setGoogleNode,
    notionNode,
    setNotionNode,
    slackNode,
    setSlackNode,
    trelloNode,
    setTrelloNode,
    githubNode,
    setGitHubNode,
    workflowTemplate,
    setWorkFlowTemplate,
    isLoading,
    hasLoaded,
    loadConnections,
  };

  return (
    <ConnectionsContext.Provider value={values}>
      {children}
    </ConnectionsContext.Provider>
  );
};

export const useNodeConnections = () => {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error(
      "useNodeConnections must be used within a ConnectionsProvider"
    );
  }
  return context;
};
