"use client";

import { EditorActions, EditorNodeType } from "@/lib/types";
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { v4 as uuidv4 } from "uuid";

export type EditorNode = EditorNodeType;

export type Editor = {
  elements: EditorNode[];
  edges: {
    id: string;
    source: string;
    target: string;
  }[];
  selectedNode: EditorNodeType;
  isAddModalOpen: boolean;
  addModalPosition: { x: number; y: number };
  activeEdgeId?: string;
  sourceNodeId?: string;
  isSidebarOpen: boolean;
  clipboard: EditorNode | null;
  runStatus: Record<string, "pending" | "running" | "success" | "error">;
  lastRunSuccess: boolean;
};

export type HistoryState = {
  history: Editor[];
  currentIndex: number;
};

export type EditorState = {
  editor: Editor;
  history: HistoryState;
};

const initialEditorState: EditorState["editor"] = {
  elements: [],
  selectedNode: {
    data: {
      completed: false,
      current: false,
      description: "",
      metadata: {},
      title: "",
      type: "Trigger",
    },
    id: "",
    position: { x: 0, y: 0 },
    type: "Trigger",
  },
  edges: [],
  isAddModalOpen: false,
  addModalPosition: { x: 0, y: 0 },
  isSidebarOpen: false,
  clipboard: null,
  runStatus: {},
  lastRunSuccess: false,
};

const initialHistoryState: HistoryState = {
  history: [initialEditorState],
  currentIndex: 0,
};

const initialState: EditorState = {
  editor: initialEditorState,
  history: initialHistoryState,
};

// Helper to push current editor state to history (max 50 entries)
const pushToHistory = (state: EditorState, newEditor: Editor): HistoryState => {
  const MAX_HISTORY = 50;
  // Slice history up to current index (discard redo stack)
  const newHistory = state.history.history.slice(
    0,
    state.history.currentIndex + 1,
  );
  newHistory.push({ ...newEditor });
  // Limit history size
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return {
    history: newHistory,
    currentIndex: newHistory.length - 1,
  };
};

const editorReducer = (
  state: EditorState = initialState,
  action: EditorActions,
): EditorState => {
  switch (action.type) {
    case "REDO":
      if (state.history.currentIndex < state.history.history.length - 1) {
        const nextIndex = state.history.currentIndex + 1;
        const nextEditorState = { ...state.history.history[nextIndex] };
        const redoState = {
          ...state,
          editor: nextEditorState,
          history: {
            ...state.history,
            currentIndex: nextIndex,
          },
        };
        return redoState;
      }
      return state;

    case "UNDO":
      if (state.history.currentIndex > 0) {
        const prevIndex = state.history.currentIndex - 1;
        const prevEditorState = { ...state.history.history[prevIndex] };
        const undoState = {
          ...state,
          editor: prevEditorState,
          history: {
            ...state.history,
            currentIndex: prevIndex,
          },
        };
        return undoState;
      }
      return state;

    case "LOAD_DATA": {
      const newEditor = {
        ...state.editor,
        elements: action.payload.elements || initialEditorState.elements,
        edges: action.payload.edges,
      };
      // Skip history push if this is initial load (empty state)
      const isInitialLoad =
        state.editor.elements.length === 0 && state.editor.edges.length === 0;
      return {
        ...state,
        editor: newEditor,
        history: isInitialLoad
          ? state.history
          : pushToHistory(state, newEditor),
      };
    }
    case "SELECTED_ELEMENT":
      return {
        ...state,
        editor: {
          ...state.editor,
          selectedNode: action.payload.element,
          isSidebarOpen: action.payload.element.id !== "",
        },
      };
    case "OPEN_ADD_MODAL":
      return {
        ...state,
        editor: {
          ...state.editor,
          isAddModalOpen: true,
          addModalPosition: action.payload.position,
          activeEdgeId: action.payload.edgeId,
          sourceNodeId: action.payload.sourceNodeId,
        },
      };
    case "CLOSE_ADD_MODAL":
      return {
        ...state,
        editor: {
          ...state.editor,
          isAddModalOpen: false,
          activeEdgeId: undefined,
          sourceNodeId: undefined,
        },
      };
    case "SET_SIDEBAR_VISIBILITY":
      return {
        ...state,
        editor: {
          ...state.editor,
          isSidebarOpen: action.payload.open,
        },
      };
    case "UPDATE_NODE": {
      const newEditor = {
        ...state.editor,
        elements: action.payload.elements,
        selectedNode:
          action.payload.elements.find(
            (el) => el.id === state.editor.selectedNode.id,
          ) || state.editor.selectedNode,
      };
      return {
        ...state,
        editor: newEditor,
        history: pushToHistory(state, newEditor),
      };
    }
    case "COPY_NODE":
      return {
        ...state,
        editor: {
          ...state.editor,
          clipboard: action.payload.node,
        },
      };
    case "PASTE_NODE": {
      if (!state.editor.clipboard) return state;
      const pastedNode: EditorNode = {
        ...state.editor.clipboard,
        id: uuidv4(),
        position: action.payload.position,
      };
      const newEditorPaste = {
        ...state.editor,
        elements: [...state.editor.elements, pastedNode],
      };
      return {
        ...state,
        editor: newEditorPaste,
        history: pushToHistory(state, newEditorPaste),
      };
    }
    case "DUPLICATE_NODE": {
      const duplicatedNode: EditorNode = {
        ...action.payload.node,
        id: uuidv4(),
        position: {
          x: action.payload.node.position.x + 100,
          y: action.payload.node.position.y + 100,
        },
      };
      const newEditorDup = {
        ...state.editor,
        elements: [...state.editor.elements, duplicatedNode],
      };
      return {
        ...state,
        editor: newEditorDup,
        history: pushToHistory(state, newEditorDup),
      };
    }
    case "DELETE_NODE": {
      const nodeIdToDelete = action.payload.nodeId;
      const newElements = state.editor.elements.filter(
        (el) => el.id !== nodeIdToDelete,
      );
      const newEdges = state.editor.edges.filter(
        (e) => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete,
      );
      const newEditorDel = {
        ...state.editor,
        elements: newElements,
        edges: newEdges,
        selectedNode:
          state.editor.selectedNode.id === nodeIdToDelete
            ? initialEditorState.selectedNode
            : state.editor.selectedNode,
        isSidebarOpen:
          state.editor.selectedNode.id === nodeIdToDelete
            ? false
            : state.editor.isSidebarOpen,
      };
      return {
        ...state,
        editor: newEditorDel,
        history: pushToHistory(state, newEditorDel),
      };
    }
    case "SET_NODE_RUN_STATUS":
      return {
        ...state,
        editor: {
          ...state.editor,
          runStatus: {
            ...state.editor.runStatus,
            [action.payload.nodeId]: action.payload.status,
          },
        },
      };
    case "CLEAR_RUN_STATUS":
      return {
        ...state,
        editor: {
          ...state.editor,
          runStatus: {},
        },
      };
    case "SET_LAST_RUN_SUCCESS":
      return {
        ...state,
        editor: {
          ...state.editor,
          lastRunSuccess: action.payload.success,
        },
      };
    default:
      return state;
  }
};

export type EditorContextData = {
  previewMode: boolean;
  setPreviewMode: (previewMode: boolean) => void;
};

export const EditorContext = createContext<{
  state: EditorState;
  dispatch: Dispatch<EditorActions>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

type EditorProps = {
  children: React.ReactNode;
  initialData?: {
    elements: EditorNodeType[];
    edges: { id: string; source: string; target: string }[];
  };
};

const EditorProvider = (props: EditorProps) => {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    editor: {
      ...initialState.editor,
      elements: props.initialData?.elements || initialState.editor.elements,
      edges: props.initialData?.edges || initialState.editor.edges,
    },
  });

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor Hook must be used within the editor Provider");
  }
  return context;
};

export default EditorProvider;
