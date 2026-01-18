import { ConnectionProviderProps } from "@/providers/connection-provider";
import { Metadata } from "next";
import { z } from "zod";

export const EditUserProfileSchema = z.object({
  email: z.string().email("Required"),
  name: z.string().min(1, "Required"),
});

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type ConnectionTypes =
  | "Google Drive"
  | "Notion"
  | "Slack"
  | "Discord"
  | "GitHub"
  | "Gmail";

export type Connection = {
  title: ConnectionTypes;
  description: string;
  image: string;
  connectionKey: keyof ConnectionProviderProps;
  accessTokenKey?: string;
  alwaysTrue?: boolean;
  slackSpecial?: boolean;
};

export type EditorCanvasTypes =
  | "Email"
  | "Condition"
  | "AI"
  | "Slack"
  | "Google Drive"
  | "Notion"
  | "Google Calendar"
  | "Discord"
  | "HTTP Request"
  | "Webhook"
  | "Data Transform"
  | "Key-Value Storage"
  | "Toast Message"
  | "End"
  | "Trigger"
  | "Action"
  | "Wait";

export type EditorCanvasCardType = {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  metadata: any;
  type: EditorCanvasTypes;
  configStatus?: "draft" | "active" | "error" | "needs_review";
};

export type EditorNodeType = {
  id: string;
  type: EditorCanvasCardType["type"];
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
      type: "SET_NODE_RUN_STATUS";
      payload: {
        nodeId: string;
        status: "pending" | "running" | "success" | "error";
      };
    }
  | { type: "CLEAR_RUN_STATUS" }
  | {
      type: "SET_LAST_RUN_SUCCESS";
      payload: {
        success: boolean;
      };
    };

export const nodeMapper: Record<
  "Notion" | "Slack" | "Discord" | "Google Drive" | "GitHub" | "Gmail",
  keyof ConnectionProviderProps
> = {
  Notion: "notionNode",
  Slack: "slackNode",
  Discord: "discordNode",
  "Google Drive": "googleNode",
  GitHub: "githubNode",
  Gmail: "googleNode",
};
