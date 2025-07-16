import { ConnectionsProvider } from "@/providers/connection-provider";
import EditorProvider from "@/providers/editor-provider";
import React from "react";
import EditorCanvas from "./_components/editor-canvas";

const Page: React.FC = () => {
  return (
    <div className="h-auto">
      <EditorProvider>
        <ConnectionsProvider>
          <EditorCanvas />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  );
};

export default Page;
