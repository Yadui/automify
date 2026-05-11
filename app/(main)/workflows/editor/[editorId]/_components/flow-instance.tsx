"use client";
import { Button } from "@/components/ui/button";
import { EditorCanvasTypes, EditorNodeType } from "@/lib/types";
import { Rocket, Save } from "lucide-react";
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
  workflowId: string;
  edges: { id: string; source: string; target: string }[];
  nodes: EditorNodeType[];
  nodeConnection?: NodeConnection;
};

const FlowInstance = ({ children, edges, nodes, workflowId }: Props) => {
  const [isFlow, setIsFlow] = useState<EditorCanvasTypes[]>([]);
  const canSave = nodes.length > 0;
  const canPublish = isFlow.length > 0;

  const onFlowAutomation = useCallback(async () => {
    const flow = await onCreateNodesEdges(
      workflowId,
      JSON.stringify(nodes),
      JSON.stringify(edges),
      JSON.stringify(isFlow)
    );

    if (flow) toast.message(flow.message);
  }, [edges, isFlow, nodes, workflowId]);

  const onPublishWorkflow = useCallback(async () => {
    const response = await onFlowPublish(workflowId, true);
    if (response) toast.message(response);
  }, [workflowId]);

  const onAutomateFlow = useCallback(() => {
    const flows: EditorCanvasTypes[] = [];
    const connectedEdges = edges.map((edge) => edge.target);
    connectedEdges.forEach((target) => {
      nodes.forEach((node) => {
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
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-[#171717]">Workflow</p>
          <p className="text-xs text-[#666666]">{nodes.length} nodes, {edges.length} links</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onFlowAutomation} disabled={!canSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm" disabled={!canPublish} onClick={onPublishWorkflow}>
            <Rocket className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default FlowInstance;
