import type { ConnectionProviderProps } from "@/providers/connection-provider";
import { z } from "zod";
import type { ConnectorRelationInput, ConnectorSettingsInput, ConnectorType } from "./connectors";

export const EditUserProfileSchema = z.object({
  email: z.string().email("Required"),
  name: z.string().min(1, "Required"),
});

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type ConnectionTypes = ConnectorType;

export type Connection = {
  title: ConnectionTypes;
  description: string;
  image: string;
  connectionKey?: keyof ConnectionProviderProps;
  accessTokenKey?: string;
  alwaysTrue?: boolean;
  slackSpecial?: boolean;
  type?: "Trigger" | "Action";
  sharedCredentialType?: ConnectionTypes;
  requiredCredentialScopes?: string[];
  settingsSchema?: ConnectorSettingsInput;
};

export type EditorCanvasTypes =
  | "Email"
  | "Condition"
  | "AI"
  | "Discord"
  | "Slack"
  | "Gmail"
  | "Google Drive"
  | "Notion"
  | "Trello"
  | "GitHub"
  | "Custom Webhook"
  | "Google Calendar"
  | "Trigger"
  | "Action"
  | "Wait";

export type EditorNodeMetadata = Record<string, unknown> & {
  defaultAction?: string;
  relations?: ConnectorRelationInput[];
  settings?: ConnectorSettingsInput;
};

export type EditorCanvasCardType = {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  metadata: EditorNodeMetadata;
  type: EditorCanvasTypes;
};

export type EditorNodeType = {
  id: string;
  type: EditorCanvasCardType["type"];
  selected?: boolean;
  dragging?: boolean;
  position: {
    x: number;
    y: number;
  };
  data: EditorCanvasCardType;
};

export type EditorNode = EditorNodeType;

export type EditorActions =
  | {
      type: "LOAD_DATA";
      payload: {
        elements: EditorNode[];
        edges: {
          id: string;
          source: string;
          target: string;
        }[];
      };
    }
  | {
      type: "UPDATE_NODE";
      payload: {
        elements: EditorNode[];
      };
    }
  | { type: "REDO" }
  | { type: "UNDO" }
  | {
      type: "SELECTED_ELEMENT";
      payload: {
        element: EditorNode;
      };
    }
  | { type: "CLEAR_RUN_STATUS" }
  | {
      type: "SET_LAST_RUN_SUCCESS";
      payload: {
        success: boolean;
      };
    }
  | {
      type: "SET_NODE_RUN_STATUS";
      payload: {
        nodeId: string;
        status: "pending" | "running" | "success" | "error";
      };
    }
  | {
      type: "OPEN_ADD_MODAL";
      payload: {
        position: { x: number; y: number };
        edgeId?: string;
        sourceNodeId?: string;
      };
    }
  | { type: "CLOSE_ADD_MODAL" }
  | {
      type: "SET_SIDEBAR_VISIBILITY";
      payload: {
        open: boolean;
      };
    }
  | {
      type: "COPY_NODE";
      payload: {
        node: EditorNode;
      };
    }
  | {
      type: "PASTE_NODE";
      payload: {
        position: { x: number; y: number };
      };
    }
  | {
      type: "DUPLICATE_NODE";
      payload: {
        node: EditorNode;
      };
    }
  | {
      type: "DELETE_NODE";
      payload: {
        nodeId: string;
      };
    };

export const nodeMapper: Partial<Record<ConnectionTypes, keyof ConnectionProviderProps>> = {
  Notion: "notionNode",
  Slack: "slackNode",
  Discord: "discordNode",
  "Google Drive": "googleNode",
  Gmail: "googleNode",
  "Google Calendar": "googleNode",
  Trello: "trelloNode",
  GitHub: "githubNode",
};
