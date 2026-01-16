"use client";
import { Button } from "@/components/ui/button";
import { useNodeConnections } from "@/providers/connection-provider";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  onCreateNodesEdges,
  onFlowPublish,
} from "../_actions/workflow-connections";
import { toast } from "sonner";

interface NodeConnection {
  discordNode: {
    content: string;
    webhookURL: string;
  };
  slackNode: {
    slackAccessToken: string;
    content: string;
  };
  // Add other node types as needed
}

type Props = {
  children: React.ReactNode;
  edges: any[];
  nodes: any[];
  nodeConnection?: NodeConnection;
};

const FlowInstance = ({ children }: Props) => {
  return (
    <div className="relative flex-1 h-full overflow-hidden">{children}</div>
  );
};

export default FlowInstance;
