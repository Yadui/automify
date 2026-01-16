import { ConnectionsProvider } from "@/providers/connection-provider";
import EditorProvider from "@/providers/editor-provider";
import React from "react";
import EditorHeader from "./_components/editor-header";
import EditorCanvas from "./_components/editor-canvas";

const Page: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorProvider>
        <ConnectionsProvider>
          <EditorHeader />
          <EditorCanvas />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  );
};

export default Page;
