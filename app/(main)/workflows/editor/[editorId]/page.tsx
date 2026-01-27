import { ConnectionsProvider } from "@/providers/connection-provider";
import EditorProvider from "@/providers/editor-provider";
import React from "react";
import EditorHeader from "./_components/editor-header";
import EditorCanvas from "./_components/editor-canvas";
import { onGetNodesEdges } from "@/app/(main)/workflows/_actions/workflow-connections";

type Props = {
  params: { editorId: string };
};

const Page = async ({ params }: Props) => {
  const workflow = await onGetNodesEdges(params.editorId);

  const initialData = workflow
    ? {
        elements: workflow.nodes ? JSON.parse(workflow.nodes as string) : [],
        edges: workflow.edges ? JSON.parse(workflow.edges as string) : [],
      }
    : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorProvider initialData={initialData}>
        <ConnectionsProvider>
          <EditorHeader />
          <EditorCanvas />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  );
};

export default Page;
