"use client";
import React, { useState } from "react";
import { CONNECTIONS } from "@/lib/constant";
import ConnectionCard from "./connection-card";

interface ConnectionStatus {
  [key: string]: boolean;
}

interface ConnectionListClientProps {
  connections: ConnectionStatus;
}

export const ConnectionListClient = ({
  connections,
}: ConnectionListClientProps) => {
  const [connectingTitle, setConnectingTitle] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      {CONNECTIONS.map((connection) => (
        <ConnectionCard
          key={connection.title}
          description={connection.description}
          title={connection.title}
          icon={connection.image}
          type={connection.title}
          connected={connections}
          isConnecting={connectingTitle === connection.title}
          isLocked={
            connectingTitle !== null && connectingTitle !== connection.title
          }
          onConnect={() => setConnectingTitle(connection.title)}
        />
      ))}
    </div>
  );
};
