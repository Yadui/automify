"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONNECTIONS, EditorCanvasDefaultCardTypes } from "@/lib/constant";
import {
  getConnector,
  getConnectorSettingsSchema,
  isConnectorType,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import { EditorCanvasTypes, EditorNodeMetadata, EditorNodeType } from "@/lib/types";
import { useNodeConnections, type ConnectionProviderProps } from "@/providers/connection-provider";
import { useEditor } from "@/providers/editor-provider";
import { fetchBotSlackChannels, onDragStart } from "@/lib/editor-utils";
import { useEditorNodeActions } from "./editor-node-actions-context";
import { useFuzzieStore } from "@/store";
import { onCreateNodesEdges } from "../_actions/workflow-connections";
import EditorCanvasIconHelper from "./editor-canvas-card-icon-hepler";
import RenderOutputAccordion from "./render-output-accordian";
import NodeConfigRouter from "./node-config-router";

type Props = {
  nodes: EditorNodeType[];
  onUpdateNodeMetadata: (nodeId: string, metadata: Partial<EditorNodeMetadata>) => void;
};

type StatusTone = "ready" | "warning" | "info" | "muted";

type StatusSummary = {
  label: string;
  detail: string;
  tone: StatusTone;
};

const statusClassName: Record<StatusTone, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  muted: "border-[#d4d4d4] bg-white text-[#4d4d4d]",
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);

const getConnectorRecord = (
  type: ConnectorType,
  nodeConnection: ConnectionProviderProps
): Record<string, unknown> => {
  if (type === "Google Drive" || type === "Gmail" || type === "Google Calendar") {
    // googleNode is stored as an array; take the first element so that
    // top-level keys like `accessToken` and `scope` are accessible directly.
    const items = nodeConnection.googleNode;
    return toRecord(Array.isArray(items) ? items[0] : items);
  }
  if (type === "Discord") return toRecord(nodeConnection.discordNode);
  if (type === "Notion") return toRecord(nodeConnection.notionNode);
  if (type === "Slack") return toRecord(nodeConnection.slackNode);
  if (type === "Trello") return toRecord(nodeConnection.trelloNode);
  if (type === "GitHub") return toRecord(nodeConnection.githubNode);
  return {};
};

const getConnectorValues = (
  type: ConnectorType,
  nodeConnection: ConnectionProviderProps
): ConnectorSettingsInput => {
  const record = getConnectorRecord(type, nodeConnection);
  const settings = toRecord(record.settings);
  return { ...record, ...settings };
};

const getMissingRequiredLabels = (
  type: ConnectorType,
  kind: "connection" | "trigger" | "action",
  settings: ConnectorSettingsInput
) =>
  getConnectorSettingsSchema(type, kind)
    .filter((field) => field.required)
    .filter((field) => !hasValue(settings[field.key] ?? field.defaultValue))
    .map((field) => field.label);

const summarizeList = (items: string[]) => {
  if (items.length === 0) return "";
  const preview = items.slice(0, 2).join(", ");
  return items.length > 2 ? `${preview}, +${items.length - 2} more` : preview;
};

const getScopeText = (settings: ConnectorSettingsInput) => {
  if (typeof settings.scope === "string") return settings.scope;
  if (typeof settings.scopes === "string") return settings.scopes;
  if (Array.isArray(settings.scopes)) return settings.scopes.join(" ");
  return "";
};

const getNodeOperationKind = (node: EditorNodeType) => {
  const defaultType = EditorCanvasDefaultCardTypes[node.type]?.type;
  return defaultType === "Trigger" ? "trigger" : "action";
};

const getAccountStatus = (
  title: string,
  nodeConnection: ConnectionProviderProps
): StatusSummary => {
  if (!isConnectorType(title)) {
    return {
      label: "Not required",
      detail: "This step does not use a connected app account.",
      tone: "muted",
    };
  }

  if (nodeConnection.isLoading) {
    return {
      label: "Checking",
      detail: "Loading connected accounts for this workspace.",
      tone: "info",
    };
  }

  if (!nodeConnection.hasLoaded) {
    return {
      label: "Not checked",
      detail: "Open Configure to check the connected account.",
      tone: "muted",
    };
  }

  const values = getConnectorValues(title, nodeConnection);
  const missing = getMissingRequiredLabels(title, "connection", values);

  if (missing.length > 0) {
    return {
      label: "Needs account",
      detail: `Missing ${summarizeList(missing)}.`,
      tone: "warning",
    };
  }

  const connector = getConnector(title);
  const missingScopes = (connector.requiredCredentialScopes ?? []).filter(
    (scope) => !getScopeText(values).includes(scope)
  );

  if (missingScopes.length > 0) {
    return {
      label: "Needs scope",
      detail: `Reconnect ${connector.sharedCredentialType ?? title} with ${title} permissions.`,
      tone: "warning",
    };
  }

  return {
    label: "Connected",
    detail: `${title} credentials are available for this node.`,
    tone: "ready",
  };
};

const getActionStatus = (
  node: EditorNodeType | null,
  hasConnectionsLoaded: boolean,
  accountStatus: StatusSummary
): StatusSummary => {
  if (!node) {
    return {
      label: "No node",
      detail: "Select a node to configure its account and action.",
      tone: "muted",
    };
  }

  const title = node.data.title;
  if (!isConnectorType(title)) {
    return {
      label: "Draft",
      detail: "Use app-specific nodes for runnable workflow steps.",
      tone: "muted",
    };
  }

  const operationKind = getNodeOperationKind(node);
  const values = node.data.metadata.settings ?? {};
  const missing = getMissingRequiredLabels(title, operationKind, values);

  if (missing.length > 0) {
    return {
      label: "Needs setup",
      detail: `Missing ${summarizeList(missing)}.`,
      tone: "warning",
    };
  }

  if (!hasConnectionsLoaded) {
    return {
      label: "Not checked",
      detail: "Open Configure to check the connected account.",
      tone: "muted",
    };
  }

  if (accountStatus.tone !== "ready") {
    return {
      label: "Waiting account",
      detail: "Step settings are complete; connect the account to run it.",
      tone: "info",
    };
  }

  return {
    label: "Ready",
    detail: "Required action settings are complete.",
    tone: "ready",
  };
};

const StatusBadge = ({ status }: { status: StatusSummary }) => (
  <Badge variant="secondary" className={`rounded-sm border ${statusClassName[status.tone]}`}>
    {status.label}
  </Badge>
);

const EditorCanvasSidebar = ({ nodes, onUpdateNodeMetadata }: Props) => {
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const nodeActions = useEditorNodeActions();
  const { loadConnections } = nodeConnection;
  const { setSlackChannels } = useFuzzieStore();
  const params = useParams<{ editorId: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(requestedTab === "configure" ? "configure" : "add");
  const [isStartingConnection, setIsStartingConnection] = useState(false);

  const selectedNode = state.editor.selectedNode.id ? state.editor.selectedNode : null;
  const selectedTitle = selectedNode?.data.title ?? "No node selected";
  const selectedDescription = selectedNode?.data.description || "Select a workflow node to view its setup status.";
  const selectedType = selectedNode ? getNodeOperationKind(selectedNode) : null;
  const accountStatus = getAccountStatus(selectedTitle, nodeConnection);
  const actionStatus = getActionStatus(selectedNode, nodeConnection.hasLoaded, accountStatus);
  const selectedConnection = isConnectorType(selectedTitle)
    ? CONNECTIONS.find((connection) => connection.title === selectedTitle)
    : null;
  const selectedConnector = isConnectorType(selectedTitle) ? getConnector(selectedTitle) : null;
  const selectedConnectionHref = useMemo(() => {
    if (!selectedNode || !selectedConnector?.oauth) return "/connections";

    const returnParams = new URLSearchParams({
      selectedNode: selectedNode.id,
      tab: "configure",
    });
    const authParams = new URLSearchParams({
      type: selectedConnector.type,
      returnTo: `${pathname}?${returnParams.toString()}`,
    });

    return `/api/auth/connect?${authParams.toString()}`;
  }, [pathname, selectedConnector, selectedNode]);
  const selectedConnectionLabel = selectedConnector?.oauth
    ? accountStatus.tone === "ready"
      ? `Reconnect ${selectedTitle}`
      : `Connect ${selectedTitle}`
    : "Manage connection";
  const canConfigureAction = Boolean(selectedNode && isConnectorType(selectedTitle));

  const availableCards = useMemo(() => {
    const hasTrigger = nodes.some((node) => getNodeOperationKind(node) === "trigger");

    return Object.entries(EditorCanvasDefaultCardTypes).filter(([cardKey, cardType]) => {
      if (cardKey === "Trigger" || cardKey === "Action") return false;
      return hasTrigger ? cardType.type === "Action" : cardType.type === "Trigger";
    });
  }, [nodes]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "configure") {
      void loadConnections();
    }
  };

  const handleConnectionLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!selectedConnector?.oauth) return;

    event.preventDefault();
    setIsStartingConnection(true);

    try {
      const connectedTargets = new Set(state.editor.edges.map((edge) => edge.target));
      const flowPath = state.editor.elements
        .filter((node) => connectedTargets.has(node.id))
        .map((node) => node.type);

      await onCreateNodesEdges(
        params.editorId,
        JSON.stringify(state.editor.elements),
        JSON.stringify(state.editor.edges),
        JSON.stringify(flowPath)
      );

      window.location.assign(selectedConnectionHref);
    } catch (error) {
      console.error("Unable to save workflow before starting connector auth", error);
      setIsStartingConnection(false);
    }
  };

  useEffect(() => {
    if (requestedTab !== "configure") return;
    setActiveTab("configure");
    void loadConnections();
  }, [loadConnections, requestedTab]);

  useEffect(() => {
    const slackAccessToken = nodeConnection.slackNode?.slackAccessToken;

    if (slackAccessToken) {
      fetchBotSlackChannels(slackAccessToken, setSlackChannels);
    }
  }, [nodeConnection.slackNode?.slackAccessToken, setSlackChannels]);

  // Auto-switch to "Add step" tab when the currently selected node's
  // configStatus transitions → "active" (i.e. the user clicked Save & Continue).
  // We track both nodeId + previous status so we only react to a real
  // transition on the SAME node, never to clicking an already-green node.
  const prevNodeConfigRef = useRef<{ id: string | undefined; status: string | undefined }>({
    id: undefined,
    status: undefined,
  });
  useEffect(() => {
    const nodeId = selectedNode?.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currStatus = (selectedNode?.data as any)?.configStatus as string | undefined;
    const { id: prevId, status: prevStatus } = prevNodeConfigRef.current;
    prevNodeConfigRef.current = { id: nodeId, status: currStatus };

    if (
      nodeId &&
      nodeId === prevId && // same node – not just clicking a different node
      prevStatus !== "active" &&
      currStatus === "active"
    ) {
      setActiveTab("add");
    }
  }, [selectedNode?.id, selectedNode?.data]);

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <div className="border-b border-[#e5e5e5] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#e5e5e5] bg-[#fafafa] text-[#171717]">
            {selectedNode ? (
              <EditorCanvasIconHelper type={selectedNode.type} />
            ) : (
              <span className="text-sm font-semibold">-</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate text-sm font-semibold text-[#171717]">{selectedTitle}</h2>
              {selectedType && (
                <Badge variant="secondary" className="rounded-sm border border-[#d4d4d4] bg-white text-[#4d4d4d]">
                  {selectedType}
                </Badge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#666666]">{selectedDescription}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-[#e5e5e5] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#666666]">Account</span>
              <StatusBadge status={accountStatus} />
            </div>
            <p className="mt-2 text-xs leading-5 text-[#666666]">{accountStatus.detail}</p>
          </div>
          <div className="rounded-md border border-[#e5e5e5] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#666666]">Action</span>
              <StatusBadge status={actionStatus} />
            </div>
            <p className="mt-2 text-xs leading-5 text-[#666666]">{actionStatus.detail}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="grid h-11 grid-cols-2 rounded-none bg-white p-0">
          <TabsTrigger
            value="add"
            className="h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none"
          >
            Add step
          </TabsTrigger>
          <TabsTrigger
            value="configure"
            className="h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none"
          >
            Configure
          </TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="add" className="m-0 flex flex-col gap-3 p-4">
            {availableCards.map(([cardKey, cardValue]) => (
              <Card
                key={cardKey}
                draggable
                className="w-full cursor-grab select-none border-[#e5e5e5] bg-white transition-colors hover:border-[#bdbdbd]"
                title="Drag onto canvas or double-click to add"
                onDragStart={(event) => onDragStart(event, cardKey as EditorCanvasTypes)}
                onDoubleClick={() => nodeActions.addNode(cardKey as EditorCanvasTypes)}
              >
                <CardHeader className="flex flex-row items-center gap-3 p-4">
                  <EditorCanvasIconHelper type={cardKey as EditorCanvasTypes} />
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold text-[#171717]">{cardKey}</CardTitle>
                    <CardDescription className="mt-1 text-xs leading-5">{cardValue.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="configure" className="m-0 h-full p-0">
            {!selectedNode ? (
              <p className="m-4 rounded-md border border-dashed border-[#d4d4d4] p-4 text-sm leading-6 text-[#666666]">
                Select a node on the canvas to configure it.
              </p>
            ) : (
              <div className="h-full">
                <NodeConfigRouter nodeType={selectedNode.type} />
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};

export default EditorCanvasSidebar;
