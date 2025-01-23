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

const FlowInstance = ({ children, edges, nodes, nodeConnection }: Props) => {
  const pathname = usePathname();
  const [isFlow, setIsFlow] = useState([]);

  const onFlowAutomation = useCallback(async () => {
    const flow = await onCreateNodesEdges(
      pathname.split("/").pop()!,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      JSON.stringify(isFlow)
    );

    if (flow) toast.message(flow.message);
  }, [edges, isFlow, nodes, pathname]);

  const onPublishWorkflow = useCallback(async () => {
    const response = await onFlowPublish(pathname.split("/").pop()!, true);
    if (response) toast.message(response);
  }, [pathname]);

  const onAutomateFlow = useCallback(() => {
    const flows: any = [];
    const connectedEdges = edges.map((edge) => edge.target);
    connectedEdges.map((target) => {
      nodes.map((node) => {
        if (node.id === target) {
          flows.push(node.type);
        }
      });
    });

    setIsFlow(flows);
  }, [edges, nodes]);

  useEffect(() => {
    onAutomateFlow();
  }, [onAutomateFlow]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 p-4">
        <Button onClick={onFlowAutomation} disabled={isFlow.length < 1}>
          Save
        </Button>
        <Button disabled={isFlow.length < 1} onClick={onPublishWorkflow}>
          Publish
        </Button>
      </div>
      {children}
    </div>
  );
};

export default FlowInstance;
