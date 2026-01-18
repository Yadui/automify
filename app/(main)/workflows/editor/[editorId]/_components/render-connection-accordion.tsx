"use client";
import React, { useState, useEffect } from "react";
import ConnectionCard from "@/app/(main)/connections/_components/connection-card";
import { AccordionContent } from "@/components/ui/accordion";
import MultipleSelector from "@/components/ui/multiple-select";
import { Connection } from "@/lib/types";
import { useNodeConnections } from "@/providers/connection-provider";
import { EditorState } from "@/providers/editor-provider";
import { useFuzzieStore } from "@/store";
import { getGoogleConnection } from "@/app/(main)/connections/_actions/google-connection";
import { getNotionConnection } from "@/app/(main)/connections/_actions/notion-connection";
import { getDiscordConnectionUrl } from "@/app/(main)/connections/_actions/discord-connections";
import { usePathname } from "next/navigation";

const RenderConnectionAccordion = ({
  connection,
  state,
}: {
  connection: Connection;
  state: EditorState;
}) => {
  const {
    title,
    image,
    description,
    connectionKey,
    accessTokenKey,
    alwaysTrue,
    slackSpecial,
  } = connection;

  const { nodeConnection } = useNodeConnections();
  const { slackChannels, selectedSlackChannels, setSelectedSlackChannels } =
    useFuzzieStore();

  // Get current path for returnUrl
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  // State for fetching actual connection from database
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(
    null
  );
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [isNotionConnected, setIsNotionConnected] = useState<boolean | null>(
    null
  );
  const [notionWorkspace, setNotionWorkspace] = useState<string | null>(null);
  const [isDiscordConnected, setIsDiscordConnected] = useState<boolean | null>(
    null
  );
  const [discordWebhookName, setDiscordWebhookName] = useState<string | null>(
    null
  );

  // Ref to track if fetch has already been done (prevents re-fetch on re-render)
  const hasFetchedRef = React.useRef(false);

  // Fetch connection status from database (only once on mount)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchConnections = async () => {
      if (title === "Gmail" || title === "Google Drive") {
        const connection = await getGoogleConnection();
        if (connection) {
          setIsGoogleConnected(true);
          setGoogleEmail((connection.metadata as any)?.email || null);
        } else {
          setIsGoogleConnected(false);
        }
      } else if (title === "Notion") {
        const connection = await getNotionConnection();
        if (connection) {
          setIsNotionConnected(true);
          setNotionWorkspace(connection.workspaceName || null);
        } else {
          setIsNotionConnected(false);
        }
      } else if (title === "Discord") {
        const connection = await getDiscordConnectionUrl();
        if (connection && connection.url) {
          setIsDiscordConnected(true);
          setDiscordWebhookName(connection.name || null);
        } else {
          setIsDiscordConnected(false);
        }
      }
    };

    fetchConnections();
  }, [title]);

  const connectionData = nodeConnection[connectionKey] as Connection;

  // Determine connection status based on service type
  const isConnected =
    title === "Gmail" || title === "Google Drive"
      ? isGoogleConnected === true
      : title === "Notion"
      ? isNotionConnected === true
      : title === "Discord"
      ? isDiscordConnected === true
      : alwaysTrue ||
        (nodeConnection[connectionKey] &&
          accessTokenKey &&
          connectionData[accessTokenKey as keyof Connection]);

  const connectedId = React.useMemo(() => {
    if (!isConnected) return undefined;
    if (title === "Slack") return nodeConnection.slackNode.teamName;
    if (title === "Discord")
      return discordWebhookName || nodeConnection.discordNode.guildName;
    if (title === "Notion")
      return notionWorkspace || nodeConnection.notionNode.workspaceName;
    if (title === "Google Drive" || title === "Gmail") {
      return googleEmail || (nodeConnection.googleNode[0] as any)?.email;
    }
    return undefined;
  }, [
    isConnected,
    title,
    nodeConnection,
    googleEmail,
    notionWorkspace,
    discordWebhookName,
  ]);

  return (
    <>
      {(state.editor.selectedNode.data.title === title ||
        (state.editor.selectedNode.data.type === "Email" &&
          title === "Gmail")) && (
        <>
          <ConnectionCard
            title={title}
            icon={image}
            description={description}
            type={title}
            connected={{ [title]: Boolean(isConnected) }}
            connectedId={connectedId}
            returnUrl={pathname}
          />
          {slackSpecial && isConnected && (
            <div className="p-6">
              {slackChannels?.length ? (
                <>
                  <div className="mb-4 ml-1">
                    Select the slack channels to send notification and messages:
                  </div>
                  <MultipleSelector
                    value={selectedSlackChannels}
                    onChange={setSelectedSlackChannels}
                    defaultOptions={slackChannels}
                    placeholder="Select channels"
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                      </p>
                    }
                  />
                </>
              ) : (
                "No Slack channels found. Please add your Slack bot to your Slack channel"
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default RenderConnectionAccordion;
