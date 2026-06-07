"use client";

import { createContext, useContext } from "react";
import { EditorCanvasCardType, EditorCanvasTypes } from "@/lib/types";

type EditorNodeActionsContextValue = {
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  canDuplicateNode: (nodeId: string) => boolean;
  /** Shallow-merge `partialData` into the node's `.data` via React Flow `setNodes`. */
  updateNodeData: (nodeId: string, partialData: Partial<EditorCanvasCardType>) => void;
  /** Create a new node from the clipboard at `position` via React Flow `setNodes`. */
  pasteNode: (position: { x: number; y: number }) => void;
  /**
   * Add a brand-new node of `type` to the canvas without drag-and-drop.
   * Position is auto-calculated:
   *  - Empty canvas  → 25% of canvas height, horizontally centred in the viewport.
   *  - Nodes present → 200 px below the lowest existing node, at the average X.
   */
  addNode: (type: EditorCanvasTypes) => void;
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
