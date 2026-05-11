import { ConnectionProviderProps } from "@/providers/connection-provider";
import { EditorState } from "@/providers/editor-provider";
import { EditorNodeMetadata, nodeMapper } from "@/lib/types";
import type { ConnectorRelationInput, ConnectorSettingsInput, ConnectorType } from "@/lib/connectors";
import React from "react";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";
import GoogleDriveFiles from "./google-drive-files";
import ActionButton from "./action-button";
import ConnectorSettingsFields from "./connector-settings-fields";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}
type MappedNodeTitle = keyof typeof nodeMapper;

const isMappedNodeTitle = (title: string): title is MappedNodeTitle =>
  title in nodeMapper;

type Props = {
  nodeConnection: ConnectionProviderProps;
  newState: EditorState;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (value: Option[]) => void;
  googleIsListening: boolean;
  onUpdateNodeMetadata: (nodeId: string, metadata: Partial<EditorNodeMetadata>) => void;
};

const ContentBasedOnTitle = ({
  nodeConnection,
  newState,
  selectedSlackChannels,
  setSelectedSlackChannels,
  googleIsListening,
  onUpdateNodeMetadata,
}: Props) => {
  const { selectedNode } = newState.editor;
  const title = selectedNode.data.title;

  if (!isMappedNodeTitle(title)) return <p>Not connected</p>;

  const mappedNodeKey = nodeMapper[title];
  if (!mappedNodeKey) return <p>Not connected</p>;

  const nodeConnectionType = nodeConnection[mappedNodeKey];
  if (!nodeConnectionType) return <p>Not connected</p>;

  const selectedConnectorType = title as ConnectorType;
  const operationKind =
    EditorCanvasDefaultCardTypes[selectedNode.type]?.type === "Trigger" ? "trigger" : "action";
  const functionalSettings = selectedNode.data.metadata.settings ?? {};
  const functionalRelations = selectedNode.data.metadata.relations ?? [];

  const updateFunctionalSettings = (settings: ConnectorSettingsInput) => {
    onUpdateNodeMetadata(selectedNode.id, { settings });

    if (title === "Google Drive" || title === "Gmail" || title === "Google Calendar") {
      nodeConnection.setGoogleNode((prev) => ({ ...prev, settings }));
    } else if (title === "Trello") {
      nodeConnection.setTrelloNode((prev) => ({ ...prev, settings }));
    } else if (title === "GitHub") {
      nodeConnection.setGitHubNode((prev) => ({ ...prev, settings }));
    } else if (title === "Slack") {
      nodeConnection.setSlackNode((prev) => ({ ...prev, ...settings }));
    } else if (title === "Discord") {
      nodeConnection.setDiscordNode((prev) => ({ ...prev, ...settings }));
    } else if (title === "Notion") {
      nodeConnection.setNotionNode((prev) => ({ ...prev, ...settings }));
    }
  };
  const updateFunctionalRelations = (relations: ConnectorRelationInput[]) => {
    onUpdateNodeMetadata(selectedNode.id, { relations });

    if (title === "Google Drive" || title === "Gmail" || title === "Google Calendar") {
      nodeConnection.setGoogleNode((prev) => ({ ...prev, relations }));
    } else if (title === "Trello") {
      nodeConnection.setTrelloNode((prev) => ({ ...prev, relations }));
    } else if (title === "GitHub") {
      nodeConnection.setGitHubNode((prev) => ({ ...prev, relations }));
    }
  };

  const isConnected =
    title === "Google Drive"
      ? !!nodeConnection.googleNode.accessToken || !!nodeConnection.googleNode.settings?.accessToken
      : title === "Slack"
      ? !!nodeConnection.slackNode.slackAccessToken
      : title === "Discord"
      ? !!nodeConnection.discordNode.webhookURL
      : title === "Notion"
      ? !!nodeConnection.notionNode.accessToken
      : title === "Gmail" || title === "Google Calendar"
      ? !!nodeConnection.googleNode.accessToken || !!nodeConnection.googleNode.settings?.accessToken
      : title === "Trello"
      ? !!nodeConnection.trelloNode.token || !!nodeConnection.trelloNode.settings?.token
      : title === "GitHub"
      ? !!nodeConnection.githubNode.accessToken || !!nodeConnection.githubNode.settings?.accessToken
      : false;

  return (
    <div className="flex flex-col gap-4">
      {title === "Discord" && isConnected && (
        <div className="rounded-md border border-[#e5e5e5] p-3">
          <p className="text-sm font-medium text-[#171717]">{nodeConnection.discordNode.webhookName}</p>
          <p className="mt-1 text-xs text-[#666666]">{nodeConnection.discordNode.guildName}</p>
        </div>
      )}

      <ConnectorSettingsFields
        type={selectedConnectorType}
        kind={operationKind}
        settings={functionalSettings}
        onChange={updateFunctionalSettings}
        relations={functionalRelations}
        onRelationsChange={updateFunctionalRelations}
      />

      {title === "Google Drive" && isConnected && (
        <GoogleDriveFiles initialIsListening={googleIsListening} />
      )}
      {isConnected && (
        <ActionButton
          currentService={title}
          nodeConnection={nodeConnection}
          channels={selectedSlackChannels}
          setChannels={setSelectedSlackChannels}
        />
      )}
    </div>
  );
};

export default ContentBasedOnTitle;
