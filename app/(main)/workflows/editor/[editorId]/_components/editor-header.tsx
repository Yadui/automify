"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  onCreateNodesEdges,
  onFlowPublish,
} from "../_actions/workflow-connections";
import { testGoogleDriveStep } from "../../../../connections/_actions/google-connection";
import { sendGmail } from "../../../../connections/_actions/google-gmail-action";
import { onGetWorkflow } from "../../../_actions/workflow-connections";
import {
  getDiscordConnectionUrl,
  postContentToWebHook,
} from "../../../../connections/_actions/discord-connections";
import {
  getNotionConnection,
  onCreateNewPageInDatabase,
} from "../../../../connections/_actions/notion-connection";
import {
  getSlackConnection,
  postMessageToSlack,
} from "../../../../connections/_actions/slack-connection";
import { toast } from "sonner";
import {
  ChevronLeft,
  Save,
  Upload,
  Workflow,
  Play,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useEditor } from "@/providers/editor-provider";
import { parseVariables } from "@/lib/utils";

const EditorHeader = () => {
  const pathname = usePathname();
  const { state, dispatch } = useEditor();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isFlow, setIsFlow] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      const workflowId = pathname.split("/").pop()!;
      if (!workflowId) return;
      const workflow = await onGetWorkflow(workflowId);
      if (workflow?.name) {
        setWorkflowName(workflow.name);
      }
      if (workflow) {
        setIsPublished(workflow.publish);
      }
    };
    fetchWorkflow();
  }, [pathname]);

  // Build flow from connected edges
  useEffect(() => {
    const flows: string[] = [];
    const connectedEdges = state.editor.edges.map((edge: any) => edge.target);
    connectedEdges.forEach((target: any) => {
      state.editor.elements.forEach((node: any) => {
        if (node.id === target) {
          flows.push(node.type);
        }
      });
    });
    setIsFlow(flows);
  }, [state.editor.edges, state.editor.elements]);

  const onFlowAutomation = useCallback(async () => {
    setIsSaving(true);
    const workflowId = pathname.split("/").pop()!;
    const response = await onCreateNodesEdges(
      workflowId,
      JSON.stringify(state.editor.elements),
      JSON.stringify(state.editor.edges),
      JSON.stringify(isFlow)
    );
    if (response) {
      if (response.message) toast.success(response.message);
      if (response.error) toast.error(response.error);
    }
    setIsSaving(false);
    return response;
  }, [state.editor.elements, state.editor.edges, isFlow, pathname]);

  // Get execution order (BFS from trigger nodes)
  const getExecutionOrder = useCallback(() => {
    const nodes = state.editor.elements;
    const edges = state.editor.edges;

    // Find trigger nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map((e) => e.target));
    const triggerNodes = nodes.filter((n) => !targetIds.has(n.id));

    const visited = new Set<string>();
    const order: string[] = [];
    const queue = [...triggerNodes.map((n) => n.id)];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      order.push(nodeId);

      // Find connected nodes
      const outgoingEdges = edges.filter((e) => e.source === nodeId);
      outgoingEdges.forEach((e) => {
        if (!visited.has(e.target)) {
          queue.push(e.target);
        }
      });
    }

    return order;
  }, [state.editor.elements, state.editor.edges]);

  const onRunWorkflow = useCallback(async () => {
    setIsRunning(true);

    // Clear previous run status
    dispatch({ type: "CLEAR_RUN_STATUS" });
    dispatch({ type: "SET_LAST_RUN_SUCCESS", payload: { success: false } });

    // Auto-save first
    toast.info("Saving workflow...");
    await onFlowAutomation();

    const executionOrder = getExecutionOrder();

    if (executionOrder.length === 0) {
      toast.error("No nodes to run");
      setIsRunning(false);
      return;
    }

    toast.info(`Running ${executionOrder.length} nodes...`);

    let allSuccess = true;
    let currentElements = [...state.editor.elements];

    for (const nodeId of executionOrder) {
      // Find the node first
      const node = currentElements.find((n) => n.id === nodeId);

      if (!node) {
        console.warn(`[Run] Node ${nodeId} not found in elements`);
        continue;
      }

      const nodeName = node.data?.title || node.data?.type || "Unknown Node";
      const nodeType = node.data?.type || "Unknown";
      const nodeEvent = node.data?.metadata?.event;

      dispatch({
        type: "SET_NODE_RUN_STATUS",
        payload: { nodeId, status: "running" },
      });

      let nodeResultData = null;
      let executionError = null;

      try {
        if (
          nodeType === "Google Drive" &&
          (nodeEvent === "new_file" || nodeEvent === "new_folder")
        ) {
          // Real GDrive polling logic
          const actionMessage =
            nodeEvent === "new_file"
              ? "Create a new file in the selected Google Drive folder"
              : "Create a new folder in the selected Google Drive parent";

          toast.info(`⏳ Waiting for action: ${actionMessage}`, {
            duration: 30000,
          });

          const nodeMetadata = node.data?.metadata || {};
          const initialResult = await testGoogleDriveStep(
            nodeEvent,
            nodeMetadata
          );
          const knownFileIds = initialResult.currentFileIds || [];

          const maxAttempts = 60;
          let attempts = 0;
          let detected = false;

          while (attempts < maxAttempts && !detected) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            attempts++;
            const configWithKnownIds = { ...nodeMetadata, knownFileIds };
            const result = await testGoogleDriveStep(
              nodeEvent,
              configWithKnownIds,
              new Date().toISOString()
            );

            if (result.success && result.data) {
              detected = true;
              nodeResultData = result.data;
              toast.success(
                `${nodeName}: New ${
                  nodeEvent === "new_file" ? "file" : "folder"
                } detected!`
              );
            } else if (result.error) {
              executionError = result.error;
              break;
            }
          }
          if (!detected && !executionError)
            executionError = "Timed out waiting for action";
        } else if (nodeType === "Toast Message") {
          const metadata = node.data?.metadata || {};
          const rawMessage = metadata.message || "Operation completed";
          const parsedMessage = parseVariables(rawMessage, currentElements);
          const type = metadata.type || "success";

          // Trigger real client-side toast
          switch (type) {
            case "success":
              toast.success(parsedMessage);
              break;
            case "error":
              toast.error(parsedMessage);
              break;
            case "info":
              toast.info(parsedMessage);
              break;
            case "warning":
              toast.warning(parsedMessage);
              break;
            default:
              toast.message(parsedMessage);
          }
          nodeResultData = { message: parsedMessage, type };
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else if (nodeType === "Email") {
          const metadata = node.data?.metadata || {};
          const to = parseVariables(metadata.to || "", currentElements);
          const subject = parseVariables(
            metadata.subject || "",
            currentElements
          );
          const message = parseVariables(
            metadata.message || "",
            currentElements
          );
          const cc = parseVariables(metadata.cc || "", currentElements);
          const bcc = parseVariables(metadata.bcc || "", currentElements);

          if (!to) throw new Error("Recipient email is missing");

          toast.info(`Sending email to ${to}...`);
          const res = await sendGmail({ to, subject, message, cc, bcc });

          if (res.success) {
            nodeResultData = {
              ...res.data,
              to,
              subject,
              message,
            };
            toast.success(`Email sent successfully!`);
          } else {
            throw new Error(res.error || "Failed to send email");
          }
        } else if (nodeType === "Discord") {
          const metadata = node.data?.metadata || {};
          const rawMessage = metadata.message || "";
          const parsedMessage = parseVariables(rawMessage, currentElements);

          if (!parsedMessage) throw new Error("Discord message is empty");

          // Get webhook URL from connection or metadata
          const webhookUrl =
            metadata.webhookUrl || (await getDiscordConnectionUrl())?.url;
          if (!webhookUrl) throw new Error("Discord webhook not configured");

          toast.info(`Posting to Discord...`);
          const res = await postContentToWebHook(parsedMessage, webhookUrl);

          if (res.message === "success") {
            nodeResultData = {
              message: parsedMessage,
              sentAt: new Date().toISOString(),
            };
            toast.success(`Discord message sent!`);
          } else {
            throw new Error(res.message || "Failed to post to Discord");
          }
        } else if (nodeType === "Notion") {
          const metadata = node.data?.metadata || {};
          const rawContent = metadata.content || "";
          const parsedContent = parseVariables(rawContent, currentElements);

          if (!parsedContent) throw new Error("Notion content is empty");

          // Get connection details
          const notionConn = await getNotionConnection();
          const databaseId = metadata.databaseId || notionConn?.databaseId;
          const accessToken = notionConn?.accessToken;

          if (!databaseId || !accessToken)
            throw new Error("Notion not configured");

          toast.info(`Creating Notion page...`);
          const res = await onCreateNewPageInDatabase(
            databaseId,
            accessToken,
            parsedContent
          );

          if (res && res.id) {
            nodeResultData = {
              pageId: res.id,
              content: parsedContent,
              createdAt: new Date().toISOString(),
            };
            toast.success(`Notion page created!`);
          } else {
            throw new Error("Failed to create Notion page");
          }
        } else if (nodeType === "Slack") {
          const metadata = node.data?.metadata || {};
          const rawMessage = metadata.message || metadata.content || "";
          const parsedMessage = parseVariables(rawMessage, currentElements);

          if (!parsedMessage) throw new Error("Slack message is empty");

          // Get Slack connection
          const slackConn = (await getSlackConnection()) as any;
          if (!slackConn?.accessToken) throw new Error("Slack not connected");

          const channels = metadata.channels || [];
          if (channels.length === 0)
            throw new Error("No Slack channels selected");

          toast.info(`Posting to Slack...`);
          const res = await postMessageToSlack(
            slackConn.accessToken,
            channels,
            parsedMessage
          );

          if (res.message === "Success") {
            nodeResultData = {
              message: parsedMessage,
              channels,
              sentAt: new Date().toISOString(),
            };
            toast.success(`Slack message sent!`);
          } else {
            throw new Error(res.message || "Failed to post to Slack");
          }
        } else {
          // Standard delay for other nodes
          await new Promise((resolve) => setTimeout(resolve, 800));
          nodeResultData = { status: "executed" };
        }
      } catch (err: any) {
        executionError = err.message || "An error occurred";
      }

      const isConfigured = node.data?.configStatus === "active";
      const success = !executionError && isConfigured;

      if (success) {
        // Update node in state with sampleData for downstream nodes
        currentElements = currentElements.map((el) => {
          if (el.id === nodeId) {
            return {
              ...el,
              data: {
                ...el.data,
                metadata: {
                  ...el.data.metadata,
                  sampleData: nodeResultData,
                },
              },
            };
          }
          return el;
        });

        dispatch({
          type: "UPDATE_NODE",
          payload: { elements: currentElements },
        });

        dispatch({
          type: "SET_NODE_RUN_STATUS",
          payload: { nodeId, status: "success" },
        });
      } else {
        allSuccess = false;
        dispatch({
          type: "SET_NODE_RUN_STATUS",
          payload: { nodeId, status: "error" },
        });
        toast.error(
          `${nodeName} failed: ${executionError || "Node not fully configured"}`
        );
        break;
      }
    }

    dispatch({
      type: "SET_LAST_RUN_SUCCESS",
      payload: { success: allSuccess },
    });

    if (allSuccess) {
      toast.success("Workflow run completed successfully!");
    } else {
      toast.error("Workflow run failed. Fix errors and try again.");
    }

    setIsRunning(false);
  }, [onFlowAutomation, getExecutionOrder, dispatch, state.editor.elements]);

  const onPublishWorkflow = useCallback(async () => {
    setIsPublishing(true);
    const workflowId = pathname.split("/").pop()!;
    // Toggle state: if currently published, unpublish it
    const newState = !isPublished;
    const response = await onFlowPublish(workflowId, newState);

    if (response) {
      if (typeof response === "object" && response.error) {
        toast.error(response.error);
      } else if (typeof response === "object" && response.message) {
        toast.success(response.message);
        setIsPublished(newState);
      } else {
        // Fallback for string response if any
        toast.message(response as unknown as string);
        setIsPublished(newState);
      }
    }
    setIsPublishing(false);
  }, [pathname, isPublished]);

  // Validation logic
  const hasTrigger = state.editor.elements.some(
    (node: any) =>
      node.type === "Trigger" ||
      node.data.type === "Trigger" ||
      node.data.type === "Google Drive"
  );
  const hasNodes = state.editor.elements.length > 0;
  const hasConnections = state.editor.edges.length > 0;
  const canPublish =
    hasTrigger && hasConnections && state.editor.lastRunSuccess;

  return (
    <header className="h-14 border-b border-muted/50 bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
      {/* Left: Back button and workflow name */}
      <div className="flex items-center gap-3">
        <Link href="/workflows">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{workflowName}</span>
        </div>
      </div>

      {/* Right: Save, Run and Publish buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onFlowAutomation}
          disabled={!hasNodes || isSaving}
          className="h-8"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onRunWorkflow}
          disabled={!hasNodes || isRunning || isSaving}
          className="h-8"
        >
          {isRunning ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isRunning ? "Running..." : "Run"}
        </Button>
        <Button
          size="sm"
          disabled={!canPublish || isPublishing}
          onClick={onPublishWorkflow}
          className={clsx(
            "h-8 transition-colors",
            isPublished
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-primary hover:bg-primary/90"
          )}
          title={
            !state.editor.lastRunSuccess
              ? "Run workflow successfully before publishing"
              : undefined
          }
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {isPublishing ? "Wait..." : isPublished ? "Unpublish" : "Publish"}
        </Button>
      </div>
    </header>
  );
};

export default EditorHeader;
