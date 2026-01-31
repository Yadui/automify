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
import {
  onGetWorkflow,
  deductCredit,
} from "../../../_actions/workflow-connections";
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
  Undo2,
  Redo2,
  Cloud,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useEditor } from "@/providers/editor-provider";
import { parseVariables } from "@/lib/utils";
import { format } from "date-fns";
import axios from "axios";

const EditorHeader = () => {
  const pathname = usePathname();
  const { state, dispatch } = useEditor();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isFlow, setIsFlow] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (state.editor.metadata) {
      setWorkflowName(state.editor.metadata.name);
      setIsPublished(state.editor.metadata.publish);
      if (state.editor.metadata.updatedAt) {
        setLastSaved(new Date(state.editor.metadata.updatedAt));
      }
    }
  }, [state.editor.metadata]);

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

  const onFlowAutomation = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsSaving(true);
      const workflowId = pathname.split("/").pop()!;
      const response = await onCreateNodesEdges(
        workflowId,
        JSON.stringify(state.editor.elements),
        JSON.stringify(state.editor.edges),
        JSON.stringify(isFlow),
      );
      if (response) {
        if (!isSilent && response.message) toast.success(response.message);
        if (response.error) toast.error(response.error);
        if (response.message) {
          setLastSaved(new Date());
          // Update state metadata so it doesn't trigger a re-sync loop if we use it for logic
          // Though here we just update local state for now.
        }
      }
      if (!isSilent) setIsSaving(false);
      return response;
    },
    [state.editor.elements, state.editor.edges, isFlow, pathname],
  );

  // Auto-save logic
  useEffect(() => {
    // Don't auto-save if elements are empty (initial load or truly empty)
    if (state.editor.elements.length === 0) return;

    const timer = setTimeout(() => {
      console.log("Auto-saving workflow...");
      onFlowAutomation(true);
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timer);
  }, [state.editor.elements, state.editor.edges, onFlowAutomation]);

  // Get execution order (BFS from trigger nodes)
  const getExecutionOrder = useCallback(() => {
    const nodes = state.editor.elements;
    const edges = state.editor.edges;

    // Find trigger nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map((e) => e.target));
    let triggerNodes = nodes.filter((n) => !targetIds.has(n.id));

    // If no start nodes found (cycle) or specific Trigger node exists, prioritize Trigger types
    if (triggerNodes.length === 0 && nodes.length > 0) {
      triggerNodes = nodes.filter(
        (n) =>
          n.type === "Trigger" ||
          n.data.type === "Trigger" ||
          n.type === "Onboarding Trigger", // Future proofing
      );
    }

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
            nodeMetadata,
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
              new Date().toISOString(),
            );

            if (result.success && result.data) {
              detected = true;
              nodeResultData = result.data;
              toast.success(
                `${nodeName}: New ${
                  nodeEvent === "new_file" ? "file" : "folder"
                } detected!`,
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
            currentElements,
          );
          const message = parseVariables(
            metadata.message || "",
            currentElements,
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
            parsedContent,
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
            parsedMessage,
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
        } else if (nodeType === "Wait") {
          // Wait node execution
          const waitConfig = node.data?.metadata?.config;
          const startedAt = new Date().toISOString();
          let waitMs = 0;

          if (waitConfig?.type === "duration") {
            const value = Number(waitConfig.value) || 0;
            const unit = waitConfig.unit || "seconds";

            // Convert to milliseconds
            switch (unit) {
              case "seconds":
                waitMs = value * 1000;
                break;
              case "minutes":
                waitMs = value * 60 * 1000;
                break;
              case "hours":
                waitMs = value * 60 * 60 * 1000;
                break;
              case "days":
                waitMs = value * 24 * 60 * 60 * 1000;
                break;
              default:
                waitMs = value * 1000;
            }

            toast.info(`Waiting for ${value} ${unit}...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
          } else if (waitConfig?.type === "until_time") {
            const targetTime = new Date(waitConfig.datetime).getTime();
            const now = Date.now();
            waitMs = Math.max(0, targetTime - now);

            if (waitMs > 0) {
              const targetDate = new Date(waitConfig.datetime);
              toast.info(`Waiting until ${targetDate.toLocaleString()}...`);
              await new Promise((resolve) => setTimeout(resolve, waitMs));
            } else {
              toast.info("Target time already passed, continuing immediately.");
            }
          }

          const resumedAt = new Date().toISOString();
          nodeResultData = {
            startedAt,
            resumedAt,
            waitDuration: waitMs,
            waitedMs: waitMs,
          };
          toast.success(`Wait complete`);
        } else if (nodeType === "HTTP Request") {
          // HTTP Request execution
          const metadata = node.data?.metadata || {};
          const method = metadata.method || "GET";
          const rawUrl = parseVariables(metadata.url || "", currentElements);

          if (!rawUrl) throw new Error("HTTP Request URL is missing");

          // Build headers
          const requestHeaders: Record<string, string> = (
            metadata.headers || []
          ).reduce(
            (
              acc: Record<string, string>,
              curr: { key: string; value: string },
            ) => {
              if (curr.key)
                acc[curr.key] = parseVariables(curr.value, currentElements);
              return acc;
            },
            {},
          );

          // Handle auth
          if (metadata.authType === "api_key" && metadata.apiKeyValue) {
            requestHeaders[metadata.apiKeyName || "X-API-Key"] = parseVariables(
              metadata.apiKeyValue,
              currentElements,
            );
          } else if (metadata.authType === "bearer" && metadata.bearerToken) {
            requestHeaders["Authorization"] =
              `Bearer ${parseVariables(metadata.bearerToken, currentElements)}`;
          }

          // Build query string
          const queryParams = metadata.queryParams || [];
          const queryString = queryParams
            .filter((q: { key: string }) => q.key)
            .map(
              (q: { key: string; value: string }) =>
                `${encodeURIComponent(q.key)}=${encodeURIComponent(parseVariables(q.value, currentElements))}`,
            )
            .join("&");
          const finalUrl = queryString ? `${rawUrl}?${queryString}` : rawUrl;

          // Parse body if present
          let bodyData;
          if (["POST", "PUT", "PATCH"].includes(method) && metadata.body) {
            try {
              const parsedBody = parseVariables(metadata.body, currentElements);
              bodyData = JSON.parse(parsedBody);
            } catch {
              bodyData = metadata.body;
            }
          }

          toast.info(`Executing ${method} ${new URL(rawUrl).hostname}...`);
          const startTime = Date.now();

          const response = await axios({
            method,
            url: finalUrl,
            headers: requestHeaders,
            data: bodyData,
            timeout: (metadata.timeout || 30) * 1000,
          });

          const duration = Date.now() - startTime;
          nodeResultData = {
            success: true,
            statusCode: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: response.data,
            duration: `${duration}ms`,
          };
          toast.success(
            `HTTP Request: ${response.status} ${response.statusText}`,
          );
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
          `${nodeName} failed: ${executionError || "Node not fully configured"}`,
        );
        break;
      }
    }

    dispatch({
      type: "SET_LAST_RUN_SUCCESS",
      payload: { success: allSuccess },
    });

    if (allSuccess) {
      // Deduct credit on successful run
      const creditResult = await deductCredit();
      if (creditResult.error) {
        toast.warning(`Workflow completed but ${creditResult.error}`);
      } else if (creditResult.remaining !== undefined) {
        toast.success(
          `Workflow completed! Credits remaining: ${creditResult.remaining}`,
        );
      } else {
        toast.success("Workflow run completed successfully!");
      }
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
      node.data.type === "Google Drive",
  );
  const hasNodes = state.editor.elements.length > 0;
  const hasConnections = state.editor.edges.length > 0;
  const canPublish =
    hasTrigger && hasConnections && state.editor.lastRunSuccess;

  // Undo/Redo availability
  const canUndo = state.history.currentIndex > 0;
  const canRedo = state.history.currentIndex < state.history.history.length - 1;

  // Keyboard shortcut: Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      if (cmdKey && e.key === "s") {
        e.preventDefault();
        if (hasNodes && !isSaving) {
          onFlowAutomation();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasNodes, isSaving, onFlowAutomation]);

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
          {lastSaved && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-muted/30 border border-muted/50">
              <Cloud className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                Last saved {format(lastSaved, "HH:mm:ss")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Undo/Redo, Save, Run and Publish buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => dispatch({ type: "UNDO" })}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => dispatch({ type: "REDO" })}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={onFlowAutomation}
          disabled={!hasNodes || isSaving}
          className="h-8"
          title="Save (⌘S)"
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
              : "bg-primary hover:bg-primary/90",
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
