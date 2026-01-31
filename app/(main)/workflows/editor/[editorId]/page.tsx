import { ConnectionsProvider } from "@/providers/connection-provider";
import EditorProvider from "@/providers/editor-provider";
import React from "react";
import EditorHeader from "./_components/editor-header";
import EditorCanvas from "./_components/editor-canvas";
import {
  onGetNodesEdges,
  onGetWorkflow,
} from "@/app/(main)/workflows/_actions/workflow-connections";
import ErrorBoundary from "@/components/error-boundary";

type Props = {
  params: { editorId: string };
};

const Page = async ({ params }: Props) => {
  const workflow = await onGetWorkflow(params.editorId);

  const initialData = workflow
    ? {
        elements: workflow.nodes ? JSON.parse(workflow.nodes as string) : [],
        edges: workflow.edges ? JSON.parse(workflow.edges as string) : [],
        metadata: {
          name: workflow.name,
          description: workflow.description || "",
          publish: workflow.publish,
          updatedAt: workflow.updatedAt.toISOString(),
        },
      }
    : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ErrorBoundary fallbackTitle="Editor Error" showHomeButton>
        <EditorProvider initialData={initialData}>
          <ConnectionsProvider>
            <EditorHeader />
            <EditorCanvas />
          </ConnectionsProvider>
        </EditorProvider>
      </ErrorBoundary>
    </div>
  );
};

export default Page;
