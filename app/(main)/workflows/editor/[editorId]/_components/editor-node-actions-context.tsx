"use client";

import { createContext, useContext } from "react";

type EditorNodeActionsContextValue = {
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  canDuplicateNode: (nodeId: string) => boolean;
};

const EditorNodeActionsContext = createContext<EditorNodeActionsContextValue | null>(null);

export const EditorNodeActionsProvider = EditorNodeActionsContext.Provider;

export const useEditorNodeActions = () => {
  const context = useContext(EditorNodeActionsContext);

  if (!context) {
    throw new Error("useEditorNodeActions must be used within EditorNodeActionsProvider");
  }

  return context;
};