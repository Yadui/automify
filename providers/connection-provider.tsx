"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { getAllConnections } from "@/app/(main)/connections/_actions/get-connections";
import type { ConnectorType } from "@/lib/connectors";

export type ConnectionProviderProps = {
  discordNode: {
    webhookURL: string;
    content: string;
    webhookName: string;
    guildName: string;
  };
  setDiscordNode: React.Dispatch<React.SetStateAction<any>>;
  googleNode: {}[];
  setGoogleNode: React.Dispatch<React.SetStateAction<any>>;
  notionNode: {
    accessToken: string;
    databaseId: string;
    workspaceName: string;
    content: "";
  };
  workflowTemplate: {
    discord?: string;
    notion?: string;
    slack?: string;
  };
  setNotionNode: React.Dispatch<React.SetStateAction<any>>;
  slackNode: {
    appId: string;
    authedUserId: string;
    authedUserToken: string;
    slackAccessToken: string;
    botUserId: string;
    teamId: string;
    teamName: string;
    content: string;
  };
  setSlackNode: React.Dispatch<React.SetStateAction<any>>;
  githubNode: {
    accessToken: string;
    content: string;
  };
  setGithubNode: React.Dispatch<React.SetStateAction<any>>;
  trelloNode: {
    apiKey: string;
    token: string;
  };
  setTrelloNode: React.Dispatch<React.SetStateAction<any>>;
  setWorkFlowTemplate: React.Dispatch<
    React.SetStateAction<{
      discord?: string;
      notion?: string;
      slack?: string;
    }>
  >;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  /** True once loadConnections has completed at least once. */
  hasLoaded: boolean;
  /** Fetches all OAuth connections for the current user and populates node states. */
  loadConnections: () => Promise<void>;
  /** Connector types that have active credentials in the DB. */
  connectedTypes: ConnectorType[];
};

type ConnectionWithChildProps = {
  children: React.ReactNode;
};

const InitialValues: ConnectionProviderProps = {
  discordNode: {
    webhookURL: "",
    content: "",
    webhookName: "",
    guildName: "",
  },
  googleNode: [],
  notionNode: {
    accessToken: "",
    databaseId: "",
    workspaceName: "",
    content: "",
  },
  workflowTemplate: {
    discord: "",
    notion: "",
    slack: "",
  },
  slackNode: {
    appId: "",
    authedUserId: "",
    authedUserToken: "",
    slackAccessToken: "",
    botUserId: "",
    teamId: "",
    teamName: "",
    content: "",
  },
  githubNode: {
    accessToken: "",
    content: "",
  },
  trelloNode: {
    apiKey: "",
    token: "",
  },
  isLoading: false,
  hasLoaded: false,
  connectedTypes: [],
  loadConnections: async () => {},
  setGoogleNode: () => undefined,
  setDiscordNode: () => undefined,
  setNotionNode: () => undefined,
  setSlackNode: () => undefined,
  setGithubNode: () => undefined,
  setTrelloNode: () => undefined,
  setIsLoading: () => undefined,
  setWorkFlowTemplate: () => undefined,
};

const ConnectionsContext = createContext(InitialValues);
const { Provider } = ConnectionsContext;

export const ConnectionsProvider = ({ children }: ConnectionWithChildProps) => {
  const [discordNode, setDiscordNode] = useState(InitialValues.discordNode);
  const [googleNode, setGoogleNode] = useState(InitialValues.googleNode);
  const [notionNode, setNotionNode] = useState(InitialValues.notionNode);
  const [slackNode, setSlackNode] = useState(InitialValues.slackNode);
  const [githubNode, setGithubNode] = useState(InitialValues.githubNode);
  const [trelloNode, setTrelloNode] = useState(InitialValues.trelloNode);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [connectedTypes, setConnectedTypes] = useState<ConnectorType[]>([]);
  const [workflowTemplate, setWorkFlowTemplate] = useState(
    InitialValues.workflowTemplate
  );

  // Ref-based lock so concurrent calls are safely ignored.
  const fetchingRef = useRef(false);

  const loadConnections = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const data = await getAllConnections();

      const discord = data.discord as Record<string, any>;
      if (discord?.url) {
        setDiscordNode({
          webhookURL: discord.url ?? "",
          content: "",
          webhookName: discord.name ?? "",
          guildName: discord.guildName ?? "",
        });
      }

      const notion = data.notion as Record<string, any>;
      if (notion?.accessToken) {
        setNotionNode({
          accessToken: notion.accessToken ?? "",
          databaseId: notion.databaseId ?? "",
          workspaceName: notion.workspaceName ?? "",
          content: "",
        });
      }

      const slack = data.slack as Record<string, any>;
      if (slack?.slackAccessToken) {
        setSlackNode({
          appId: slack.appId ?? "",
          authedUserId: slack.authedUserId ?? "",
          authedUserToken: slack.authedUserToken ?? "",
          slackAccessToken: slack.slackAccessToken ?? "",
          botUserId: slack.botUserId ?? "",
          teamId: slack.teamId ?? "",
          teamName: slack.teamName ?? "",
          content: "",
        });
      }

      const google = data.google as Record<string, any>;
      if (google?.accessToken) {
        const settings = (google.settings ?? {}) as Record<string, any>;
        setGoogleNode([
          {
            accessToken: google.accessToken ?? "",
            refreshToken: google.refreshToken ?? "",
            scope: settings.scope ?? google.scope ?? "",
          },
        ]);
      }

      // Populate githubNode from db.connections settings
      const github = data.byType["GitHub"] as Record<string, any> | undefined;
      if (github?.settings) {
        const ghSettings = github.settings as Record<string, any>;
        setGithubNode((prev: any) => ({
          ...prev,
          accessToken: typeof ghSettings.accessToken === "string"
            ? ghSettings.accessToken
            : prev?.accessToken ?? "",
        }));
      }

      setConnectedTypes(Object.keys(data.byType) as ConnectorType[]);
      setHasLoaded(true);
    } catch (err) {
      console.error("[ConnectionsProvider] loadConnections error:", err);
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const values: ConnectionProviderProps = {
    discordNode,
    setDiscordNode,
    googleNode,
    setGoogleNode,
    notionNode,
    setNotionNode,
    slackNode,
    setSlackNode,
    githubNode,
    setGithubNode,
    trelloNode,
    setTrelloNode,
    isLoading,
    setIsLoading,
    hasLoaded,
    loadConnections,
    connectedTypes,
    workflowTemplate,
    setWorkFlowTemplate,
  };

  return <Provider value={values}>{children}</Provider>;
};

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext);
  return { nodeConnection };
};
