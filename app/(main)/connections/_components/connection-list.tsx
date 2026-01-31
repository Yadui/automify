import React from "react";
import { getUserData } from "../_actions/get-user";
import { ConnectionListClient } from "./connection-list-client";

interface ConnectionListProps {
  userId: number;
}

interface ConnectionStatus {
  [key: string]: boolean;
}

const ConnectionList = async ({ userId }: ConnectionListProps) => {
  const onUserConnections = async () => {
    const connections: ConnectionStatus = {
      Notion: false,
      Slack: false,
      "Google Drive": false,
      Discord: false,
      GitHub: false,
    };

    const user_info = await getUserData(userId);

    user_info?.connections.forEach((connection) => {
      if (connection.provider === "google") {
        connections["Google Drive"] = true;
        connections["Gmail"] = true;
      }
      if (connection.provider === "slack") connections["Slack"] = true;
      if (connection.provider === "notion") connections["Notion"] = true;
      if (connection.provider === "discord") connections["Discord"] = true;
      if (connection.provider === "github") connections["GitHub"] = true;
    });

    return connections;
  };

  const connections = await onUserConnections();

  return (
    <div className="grid gap-4">
      <ConnectionListClient connections={connections} />
    </div>
  );
};

export default ConnectionList;
