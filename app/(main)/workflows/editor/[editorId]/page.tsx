import { ConnectionsProvider } from "@/providers/connection-provider";
import EditorProvider from "@/providers/editor-provider";
import type { EditorNodeType } from "@/lib/types";
import React from "react";
import EditorCanvas from "./_components/editor-canvas";
import { onGetNodesEdges } from "../../_actions/workflow-connections";

type WorkflowEditorPageProps = {
  params: Promise<{
    editorId: string;
  }>;
};

type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

const parseWorkflowJson = <T,>(value: string | null | undefined): T[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const Page = async ({ params }: WorkflowEditorPageProps) => {
  const { editorId } = await params;
  const workflow = await onGetNodesEdges(editorId);
  const initialNodes = parseWorkflowJson<EditorNodeType>(workflow?.nodes);
  const initialEdges = parseWorkflowJson<WorkflowEdge>(workflow?.edges);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <EditorProvider>
        <ConnectionsProvider>
          <EditorCanvas
            workflowId={editorId}
            initialNodes={initialNodes}
            initialEdges={initialEdges}
          />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  );
};

export default Page;
