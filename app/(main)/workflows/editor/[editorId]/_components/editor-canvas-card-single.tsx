import { EditorCanvasCardType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import { useNodeConnections, type ConnectionProviderProps } from "@/providers/connection-provider";
import React, { useMemo } from "react";
import { Position, useNodeId } from "reactflow";
import EditorCanvasIconHelper from "./editor-canvas-card-icon-hepler";
import CustomHandle from "./custom-handle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorNodeActions } from "./editor-node-actions-context";
import { cn } from "@/lib/utils";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";
import {
  getConnector,
  getConnectorSettingsSchema,
  isConnectorType,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);

const getConnectorRecord = (
  type: ConnectorType,
  nodeConnection: ConnectionProviderProps
): Record<string, unknown> => {
  if (type === "Google Drive" || type === "Gmail" || type === "Google Calendar") {
    return toRecord(nodeConnection.googleNode);
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

const getScopeText = (settings: ConnectorSettingsInput) => {
  if (typeof settings.scope === "string") return settings.scope;
  if (typeof settings.scopes === "string") return settings.scopes;
  if (Array.isArray(settings.scopes)) return settings.scopes.join(" ");
  return "";
};

const hasRequiredSettings = (
  type: ConnectorType,
  kind: "connection" | "trigger" | "action",
  settings: ConnectorSettingsInput
) =>
  getConnectorSettingsSchema(type, kind).every((field) =>
    !field.required || hasValue(settings[field.key] ?? field.defaultValue)
  );

const isNodeReady = (data: EditorCanvasCardType, nodeConnection: ConnectionProviderProps) => {
  if (!isConnectorType(data.title) || !nodeConnection.hasLoaded) return false;

  const accountValues = getConnectorValues(data.title, nodeConnection);
  const connector = getConnector(data.title);
  const hasScopes = (connector.requiredCredentialScopes ?? []).every((scope) =>
    getScopeText(accountValues).includes(scope)
  );
  const operationKind = EditorCanvasDefaultCardTypes[data.type]?.type === "Trigger" ? "trigger" : "action";

  return (
    hasScopes &&
    hasRequiredSettings(data.title, "connection", accountValues) &&
    hasRequiredSettings(data.title, operationKind, data.metadata.settings ?? {})
  );
};

const EditorCanvasCardSingle = ({ data }: { data: EditorCanvasCardType }) => {
  const { dispatch, state } = useEditor();
  const nodeConnection = useNodeConnections();
  const { canDuplicateNode, deleteNode, duplicateNode } = useEditorNodeActions();
  const nodeId = useNodeId();
  const statusLabel = data.current
    ? "Running"
    : data.completed || isNodeReady(data, nodeConnection)
      ? "Ready"
      : "Draft";
  const canDuplicate = nodeId ? canDuplicateNode(nodeId) : false;
  const isSelected = Boolean(nodeId && state.editor.selectedNode.id === nodeId);
  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />;
  }, [data]);

  const handleDuplicate = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (nodeId) duplicateNode(nodeId);
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (nodeId) deleteNode(nodeId);
  };

  return (
    <>
      {data.type !== "Trigger" && data.type !== "Google Drive" && (
        <CustomHandle
          type="target"
          position={Position.Top}
          style={{ zIndex: 100 }}
        />
      )}
      <Card
        onClick={(e) => {
          e.stopPropagation();
          const val = state.editor.elements.find((n) => n.id === nodeId);
          if (val)
            dispatch({
              type: "SELECTED_ELEMENT",
              payload: {
                element: val,
              },
            });
        }}
        className={cn(
          "relative max-w-[400px] border-2 bg-white shadow-sm",
          isSelected ? "border-black dark:border-white" : "border-[#d4d4d4] dark:border-muted-foreground/70"
        )}
      >
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 rounded-sm border border-[#d4d4d4] bg-white px-2 py-0.5 text-[10px] font-medium text-[#4d4d4d]"
        >
          {statusLabel}
        </Badge>
        <TooltipProvider delayDuration={0}>
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/90 text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px] hover:bg-[#fafafa] hover:text-[#171717]"
                  aria-label={`Duplicate ${data.title} node`}
                  disabled={!canDuplicate}
                  onClick={handleDuplicate}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{canDuplicate ? "Duplicate" : "Only one trigger is allowed"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/90 text-[#d92d20] shadow-[rgb(235,235,235)_0px_0px_0px_1px] hover:bg-[#fff3f0] hover:text-[#b42318]"
                  aria-label={`Delete ${data.title} node`}
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <CardHeader className="flex flex-row items-center gap-4 pt-8">
          <div>{logo}</div>
          <div>
            <CardTitle className="text-md">{data.title}</CardTitle>
            <CardDescription>
              <p className="text-xs text-muted-foreground/50">
                <b className="text-muted-foreground/80">ID: </b>
                {nodeId}
              </p>
              <p>{data.description}</p>
            </CardDescription>
          </div>
        </CardHeader>
        <Badge variant="secondary" className="absolute right-2 top-11">
          {data.type}
        </Badge>
      </Card>
      <CustomHandle type="source" position={Position.Bottom} id="a" />
    </>
  );
};

export default EditorCanvasCardSingle;
