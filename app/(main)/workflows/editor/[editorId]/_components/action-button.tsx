import React, { useCallback } from "react";
import { Option } from "./content-based-on-title";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { postContentToWebHook } from "@/app/(main)/connections/_actions/discord-connections";
import { onCreateNodeTemplate } from "../../../_actions/workflow-connections";
import { toast } from "sonner";
import { onCreateNewPageInDatabase } from "@/app/(main)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/connections/_actions/slack-connection";

// Define specific types
interface NodeConnection {
  discordNode: {
    content: string;
    webhookURL: string;
  };
  slackNode: {
    slackAccessToken: string;
    content: string;
  };
  notionNode: {
    accessToken: string;
    databaseId: string;
    content: string;
  };
}

type Props = {
  currentService: string;
  nodeConnection: NodeConnection;
  channels?: Option[];
  setChannels?: (value: Option[]) => void;
};

const ActionButton = ({
  currentService,
  nodeConnection,
  channels,
  setChannels,
}: Props) => {
  const pathname = usePathname();

  const onSendDiscordMessage = useCallback(async () => {
    const response = await postContentToWebHook(
      nodeConnection.discordNode.content,
      nodeConnection.discordNode.webhookURL
    );

    if (response.message == "success") {
      nodeConnection.discordNode.content = "";
    }
  }, [nodeConnection.discordNode]);

  const onStoreNotionContent = useCallback(async () => {
    console.log(
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    );
    const response = await onCreateNewPageInDatabase(
      nodeConnection.notionNode.databaseId,
      nodeConnection.notionNode.accessToken,
      nodeConnection.notionNode.content
    );
    if (response) {
      nodeConnection.notionNode.content = "";
    }
  }, [nodeConnection.notionNode]);

  const onStoreSlackContent = useCallback(async () => {
    const response = await postMessageToSlack(
      nodeConnection.slackNode.slackAccessToken,
      channels!,
      nodeConnection.slackNode.content
    );
    if (response.message == "Success") {
      toast.success("Message sent successfully");
      nodeConnection.slackNode.content = "";
      setChannels!([]);
    } else {
      toast.error(response.message);
    }
  }, [nodeConnection.slackNode, channels, setChannels]);

  const onCreateLocalNodeTempate = useCallback(async () => {
    if (currentService === "Discord") {
      const response = await onCreateNodeTemplate(
        nodeConnection.discordNode.content,
        currentService,
        pathname.split("/").pop()!
      );

      if (response) {
        toast.message(response);
      }
    }
    if (currentService === "Slack") {
      const response = await onCreateNodeTemplate(
        nodeConnection.slackNode.content,
        currentService,
        pathname.split("/").pop()!,
        channels,
        nodeConnection.slackNode.slackAccessToken
      );

      if (response) {
        toast.message(response);
      }
    }

    if (currentService === "Notion") {
      const response = await onCreateNodeTemplate(
        JSON.stringify(nodeConnection.notionNode.content),
        currentService,
        pathname.split("/").pop()!,
        [],
        nodeConnection.notionNode.accessToken,
        nodeConnection.notionNode.databaseId
      );

      if (response) {
        toast.message(response);
      }
    }
  }, [nodeConnection, channels, currentService, pathname]);

  const renderActionButton = () => {
    switch (currentService) {
      case "Discord":
        return (
          <>
            <Button variant="outline" onClick={onSendDiscordMessage}>
              Test Message
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );

      case "Notion":
        return (
          <>
            <Button variant="outline" onClick={onStoreNotionContent}>
              Test
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );

      case "Slack":
        return (
          <>
            <Button variant="outline" onClick={onStoreSlackContent}>
              Send Message
            </Button>
            <Button onClick={onCreateLocalNodeTempate} variant="outline">
              Save Template
            </Button>
          </>
        );

      default:
        return null;
    }
  };
  return renderActionButton();
};

export default ActionButton;
