"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  onCreateNodesEdges,
  onFlowPublish,
} from "../_actions/workflow-connections";
import { onCreateWorkflowLog } from "../../../_actions/workflow-connections";
import { testGoogleDriveStep } from "../../../../connections/_actions/google-connection";
import { sendGmail } from "../../../../connections/_actions/google-gmail-action";
import {
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
import {
  fetchRecentIssue,
  fetchRecentPR,
  createGitHubIssue,
} from "../../../../connections/_actions/github-connection";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronLeft,
  Cloud,
  Headphones,
  Play,
  Square,
  Redo2,
  Save,
  Undo2,
  Upload,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useEditor } from "@/providers/editor-provider";
import { parseVariables } from "@/lib/utils";
import { evaluateCondition } from "@/lib/workflow-utils";
import { format } from "date-fns";
import axios from "axios";

/** Resolves after `ms` ms, or rejects with an AbortError when the signal fires. */
const abortableSleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => { clearTimeout(id); reject(new DOMException("Aborted", "AbortError")); },
      { once: true },
    );
  });

const EditorHeader = () => {
  const pathname = usePathname();
  const { state, dispatch } = useEditor();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  /** Holds the controller for the active run so the Stop button can abort it. */
  const abortRef = useRef<AbortController | null>(null);
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

  // Derive the list of connected node types from edges — useMemo instead of
  // useState + useEffect so we never call setState during render, which would
  // cause an infinite "maximum update depth exceeded" loop when the context
  // produces new array references on every LOAD_DATA dispatch.
  const isFlow = useMemo(() => {
    const connectedTargets = state.editor.edges.map((edge: any) => edge.target);
    return connectedTargets.flatMap((target: string) => {
      const node = state.editor.elements.find((n: any) => n.id === target);
      return node ? [node.type as string] : [];
    });
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
        const res = response as { message?: string; error?: string };
        if (!isSilent && res.message) toast.success(res.message);
        if (res.error) toast.error(res.error);
        if (res.message) {
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
      onFlowAutomation(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.editor.elements, state.editor.edges, onFlowAutomation]);

  // Get execution order (BFS from trigger nodes)
  // Returns ordered node IDs — condition branching is handled during execution
  const getExecutionOrder = useCallback(() => {
    const nodes = state.editor.elements;
    const edges = state.editor.edges;

    // Find trigger nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map((e) => e.target));
    let triggerNodes = nodes.filter((n) => !targetIds.has(n.id));

    if (triggerNodes.length === 0 && nodes.length > 0) {
      triggerNodes = nodes.filter(
        (n) =>
          (n.type as string) === "Trigger" ||
          n.data.type === "Trigger" ||
          (n.type as string) === "Onboarding Trigger",
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

      const outgoingEdges = edges.filter((e) => e.source === nodeId);
      outgoingEdges.forEach((e) => {
        if (!visited.has(e.target)) queue.push(e.target);
      });
    }

    return order;
  }, [state.editor.elements, state.editor.edges]);

  /**
   * Given a Condition node result, collect all node IDs that are downstream
   * of its FALSE branch so they can be skipped during execution.
   */
  const getFalseBranchIds = useCallback((conditionNodeId: string): Set<string> => {
    const edges = state.editor.edges;
    const nodes = state.editor.elements;

    // Edges labelled "false" (or the second outgoing edge by convention)
    const outgoing = edges.filter((e) => e.source === conditionNodeId);
    if (outgoing.length < 2) return new Set(); // no false branch

    // Convention: edge with label "false" or sourceHandle "false"
    const falseEdge =
      outgoing.find((e) => (e as any).label === "false" || (e as any).sourceHandle === "false") ||
      outgoing[1]; // fallback: second edge is false branch

    const skipped = new Set<string>();
    const queue = [falseEdge.target];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (skipped.has(id)) continue;
      skipped.add(id);
      edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target));
    }
    return skipped;
  }, [state.editor.edges, state.editor.elements]);

  const onRunWorkflow = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;
    const runStart = Date.now();
    const workflowId = pathname.split("/").pop()!;

    dispatch({ type: "SET_RUNNING", payload: { running: true } });
    dispatch({ type: "CLEAR_RUN_STATUS" });
    dispatch({ type: "SET_LAST_RUN_SUCCESS", payload: { success: false } });

    try {
      // Auto-save first
      toast.info("Saving workflow...");
      await onFlowAutomation();

      if (signal.aborted) { toast.info("Workflow stopped."); return; }

      const executionOrder = getExecutionOrder();
      if (executionOrder.length === 0) {
        toast.error("No nodes to run");
        return;
      }

      toast.info(`Running ${executionOrder.length} nodes...`);

      let allSuccess = true;
      let stopped = false;
      let currentElements = [...state.editor.elements];
      const skippedNodes = new Set<string>(); // nodes skipped due to condition false branch

      for (const nodeId of executionOrder) {
        if (signal.aborted || stopped) { stopped = true; break; }

        const node = currentElements.find((n) => n.id === nodeId);
        if (!node) { console.warn(`[Run] Node ${nodeId} not found in elements`); continue; }

        // Skip nodes that are on a condition's false branch
        if (skippedNodes.has(nodeId)) {
          dispatch({ type: "SET_NODE_RUN_STATUS", payload: { nodeId, status: "skipped" } });
          continue;
        }

        const nodeName = node.data?.title || node.data?.type || "Unknown Node";
        const nodeType: string = node.data?.type || "Unknown";
        const nodeEvent = node.data?.metadata?.event as string | undefined;

        dispatch({ type: "SET_NODE_RUN_STATUS", payload: { nodeId, status: "running" } });

        let nodeResultData = null;
        let executionError = null;

        try {
          if (
            nodeType === "Google Drive" &&
            (nodeEvent === "new_file" || nodeEvent === "new_folder")
          ) {
            const actionMessage =
              nodeEvent === "new_file"
                ? "Create a new file in the selected Google Drive folder"
                : "Create a new folder in the selected Google Drive parent";

            toast.info(`⏳ Waiting for action: ${actionMessage}`, { duration: 30000 });

            const nodeMetadata = (node.data?.metadata || {}) as Record<string, any>;
            const initialResult = await testGoogleDriveStep(nodeEvent, nodeMetadata);
            const knownFileIds = initialResult.currentFileIds || [];

            const maxAttempts = 60;
            let attempts = 0;
            let detected = false;

            while (attempts < maxAttempts && !detected) {
              await abortableSleep(3000, signal);
              if (signal.aborted) break;
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
                  `${nodeName}: New ${nodeEvent === "new_file" ? "file" : "folder"} detected!`,
                );
              } else if (result.error) {
                executionError = result.error;
                break;
              }
            }
            if (!detected && !executionError && !signal.aborted)
              executionError = "Timed out waiting for action";
          } else if (nodeType === "Toast Message") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const rawMessage = metadata.message || "Operation completed";
            const parsedMessage = parseVariables(rawMessage, currentElements);
            const type = metadata.type || "success";

            switch (type) {
              case "success": toast.success(parsedMessage); break;
              case "error":   toast.error(parsedMessage); break;
              case "info":    toast.info(parsedMessage); break;
              case "warning": toast.warning(parsedMessage); break;
              default:        toast.message(parsedMessage);
            }
            nodeResultData = { message: parsedMessage, type };
            await abortableSleep(500, signal);
          } else if (nodeType === "Email") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const to      = parseVariables(metadata.to      || "", currentElements);
            const subject = parseVariables(metadata.subject || "", currentElements);
            const message = parseVariables(metadata.message || "", currentElements);
            const cc      = parseVariables(metadata.cc      || "", currentElements);
            const bcc     = parseVariables(metadata.bcc     || "", currentElements);

            if (!to) throw new Error("Recipient email is missing");
            toast.info(`Sending email to ${to}...`);
            const res = await sendGmail({ to, subject, message, cc, bcc });
            if (res.success) {
              nodeResultData = { ...res.data, to, subject, message };
              toast.success(`Email sent successfully!`);
            } else {
              throw new Error(res.error || "Failed to send email");
            }
          } else if (nodeType === "Discord") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const rawMessage = metadata.message || "";
            const parsedMessage = parseVariables(rawMessage, currentElements);

            if (!parsedMessage) throw new Error("Discord message is empty");
            const webhookUrl =
              metadata.webhookUrl || (await getDiscordConnectionUrl())?.url;
            if (!webhookUrl) throw new Error("Discord webhook not configured");

            toast.info(`Posting to Discord...`);
            const res = await postContentToWebHook(parsedMessage, webhookUrl);
            if (res.message === "success") {
              nodeResultData = { message: parsedMessage, sentAt: new Date().toISOString() };
              toast.success(`Discord message sent!`);
            } else {
              throw new Error(res.message || "Failed to post to Discord");
            }
          } else if (nodeType === "Notion") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const rawContent = metadata.content || "";
            const parsedContent = parseVariables(rawContent, currentElements);

            if (!parsedContent) throw new Error("Notion content is empty");
            const notionConn = await getNotionConnection();
            const databaseId = metadata.databaseId || notionConn?.databaseId;
            const accessToken = notionConn?.accessToken;
            if (!databaseId || !accessToken) throw new Error("Notion not configured");

            toast.info(`Creating Notion page...`);
            const res = await onCreateNewPageInDatabase(databaseId, accessToken, parsedContent);
            if (res && res.id) {
              nodeResultData = { pageId: res.id, content: parsedContent, createdAt: new Date().toISOString() };
              toast.success(`Notion page created!`);
            } else {
              throw new Error("Failed to create Notion page");
            }
          } else if (nodeType === "Slack") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const rawMessage = metadata.message || metadata.content || "";
            const parsedMessage = parseVariables(rawMessage, currentElements);

            if (!parsedMessage) throw new Error("Slack message is empty");
            const slackConn = (await getSlackConnection()) as any;
            if (!slackConn?.accessToken) throw new Error("Slack not connected");
            const channels = metadata.channels || [];
            if (channels.length === 0) throw new Error("No Slack channels selected");

            toast.info(`Posting to Slack...`);
            const res = await postMessageToSlack(slackConn.accessToken, channels, parsedMessage);
            if (res.message === "Success") {
              nodeResultData = { message: parsedMessage, channels, sentAt: new Date().toISOString() };
              toast.success(`Slack message sent!`);
            } else {
              throw new Error(res.message || "Failed to post to Slack");
            }
          } else if (nodeType === "Wait") {
            const waitConfig = node.data?.metadata?.config as any;
            const startedAt = new Date().toISOString();
            let waitMs = 0;

            if (waitConfig?.type === "duration") {
              const value = Number(waitConfig.value) || 0;
              const unit  = waitConfig.unit || "seconds";
              switch (unit) {
                case "seconds": waitMs = value * 1000; break;
                case "minutes": waitMs = value * 60 * 1000; break;
                case "hours":   waitMs = value * 60 * 60 * 1000; break;
                case "days":    waitMs = value * 24 * 60 * 60 * 1000; break;
                default:        waitMs = value * 1000;
              }
              toast.info(`Waiting for ${value} ${unit}...`);
              await abortableSleep(waitMs, signal);
            } else if (waitConfig?.type === "until_time") {
              const targetTime = new Date(waitConfig.datetime).getTime();
              const now = Date.now();
              waitMs = Math.max(0, targetTime - now);
              if (waitMs > 0) {
                toast.info(`Waiting until ${new Date(waitConfig.datetime).toLocaleString()}...`);
                await abortableSleep(waitMs, signal);
              } else {
                toast.info("Target time already passed, continuing immediately.");
              }
            }

            nodeResultData = {
              startedAt,
              resumedAt:    new Date().toISOString(),
              waitDuration: waitMs,
              waitedMs:     waitMs,
            };
            toast.success(`Wait complete`);
          } else if (nodeType === "AI") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const resolvedInput = parseVariables(metadata.input || "", currentElements);
            if (!resolvedInput) throw new Error("AI node: input is empty");
            toast.info(`AI: running ${metadata.operation || "task"}...`);
            const res = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation:          metadata.operation || "generate",
                provider:           metadata.provider  || "groq",
                model:              metadata.model     || "fast",
                input:              resolvedInput,
                extractFields:      metadata.extractFields,
                customSystemPrompt: metadata.customSystemPrompt,
                customUserPrompt:   metadata.customUserPrompt
                  ? parseVariables(metadata.customUserPrompt, currentElements)
                  : undefined,
                ...(metadata.apiKey && { apiKey: metadata.apiKey }),
              }),
              signal,
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "AI request failed");
            nodeResultData = { output: data.output, raw: data.raw, operation: data.operation };
            toast.success(`AI: done`);
          } else if (nodeType === "Condition") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const conditions = metadata.conditions || [];
            const rootLogic = metadata.rootLogic || "AND";
            const passed = evaluateCondition(conditions, rootLogic, currentElements);
            nodeResultData = { result: passed, conditions, rootLogic };
            toast.info(`Condition: ${passed ? "✓ true — continuing" : "✗ false — skipping branch"}`);
            if (!passed) {
              // Mark all false-branch nodes as skipped
              const toSkip = getFalseBranchIds(nodeId);
              toSkip.forEach((id) => skippedNodes.add(id));
            }
          } else if (nodeType === "Key-Value Storage") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const action = metadata.action || "get";
            const key = parseVariables(metadata.key || "", currentElements);
            const value = parseVariables(metadata.value || "", currentElements);
            if (!key) throw new Error("KV Storage: key is required");
            let result: any;
            if (action === "get") {
              const res = await fetch(`/api/kv?key=${encodeURIComponent(key)}`);
              result = await res.json();
            } else if (action === "delete") {
              const res = await fetch(`/api/kv?key=${encodeURIComponent(key)}`, { method: "DELETE" });
              result = await res.json();
            } else {
              const res = await fetch("/api/kv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value, action, incrementBy: action === "increment" ? Number(value) || 1 : undefined }),
              });
              result = await res.json();
            }
            if (result.error) throw new Error(`KV Storage: ${result.error}`);
            nodeResultData = result;
            toast.success(`KV Storage: ${action} '${key}' done`);
          } else if (nodeType === "Data Transform") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const operation = metadata.operation || "merge";
            const rawInput = parseVariables(metadata.inputData || "", currentElements);
            const rawParam = parseVariables(metadata.param1 || "", currentElements);
            const safeJson = (s: string, fb: any = {}) => { try { return JSON.parse(s); } catch { return fb; } };
            const input = safeJson(rawInput);
            let output: any;
            switch (operation) {
              case "pick": {
                const keys = rawParam.split(",").map((k: string) => k.trim());
                output = keys.reduce((obj: any, k: string) => { if (k in input) obj[k] = input[k]; return obj; }, {});
                break;
              }
              case "omit": {
                const keys = rawParam.split(",").map((k: string) => k.trim());
                output = { ...input };
                keys.forEach((k: string) => delete output[k]);
                break;
              }
              case "merge":
                output = { ...input, ...safeJson(rawParam) };
                break;
              case "json_stringify":
                output = JSON.stringify(input);
                break;
              case "json_parse":
                output = JSON.parse(typeof input === "string" ? input : JSON.stringify(input));
                break;
              default:
                throw new Error(`Data Transform: unknown operation '${operation}'`);
            }
            nodeResultData = { result: output };
            toast.success(`Data Transform: ${operation} done`);
          } else if (nodeType === "Google Calendar") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const { testGoogleCalendarStep } = await import(
              "../../../../connections/_actions/google-connection"
            );
            const action = metadata.action || "create_event";
            toast.info(`Google Calendar: executing ${action}...`);
            const res = await testGoogleCalendarStep(action, metadata as any);
            if (!res.success) throw new Error(res.error || "Google Calendar action failed");
            nodeResultData = res.data;
            toast.success(`Google Calendar: done`);
          } else if (nodeType === "HTTP Request") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const method  = metadata.method || "GET";
            const rawUrl  = parseVariables(metadata.url || "", currentElements);

            if (!rawUrl) throw new Error("HTTP Request URL is missing");

            const requestHeaders: Record<string, string> = (metadata.headers || []).reduce(
              (acc: Record<string, string>, curr: { key: string; value: string }) => {
                if (curr.key) acc[curr.key] = parseVariables(curr.value, currentElements);
                return acc;
              },
              {},
            );

            if (metadata.authType === "api_key" && metadata.apiKeyValue) {
              requestHeaders[metadata.apiKeyName || "X-API-Key"] =
                parseVariables(metadata.apiKeyValue, currentElements);
            } else if (metadata.authType === "bearer" && metadata.bearerToken) {
              requestHeaders["Authorization"] =
                `Bearer ${parseVariables(metadata.bearerToken, currentElements)}`;
            }

            const queryParams = metadata.queryParams || [];
            const queryString = queryParams
              .filter((q: { key: string }) => q.key)
              .map(
                (q: { key: string; value: string }) =>
                  `${encodeURIComponent(q.key)}=${encodeURIComponent(parseVariables(q.value, currentElements))}`,
              )
              .join("&");
            const finalUrl = queryString ? `${rawUrl}?${queryString}` : rawUrl;

            let bodyData;
            if (["POST", "PUT", "PATCH"].includes(method) && metadata.body) {
              try {
                bodyData = JSON.parse(parseVariables(metadata.body, currentElements));
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
              signal, // cancelled when user clicks Stop
            });

            nodeResultData = {
              success:    true,
              statusCode: response.status,
              statusText: response.statusText,
              headers:    response.headers,
              body:       response.data,
              duration:   `${Date.now() - startTime}ms`,
            };
            toast.success(`HTTP Request: ${response.status} ${response.statusText}`);
          } else if (nodeType === "GitHub") {
            const metadata = (node.data?.metadata || {}) as Record<string, any>;
            const repository   = (metadata.repository   as string) || "";
            const stateFilter  = (metadata.stateFilter  as string) || "open";

            if (nodeEvent === "github.issue_opened") {
              if (!repository) throw new Error("GitHub repository not configured");
              toast.info(`Fetching latest GitHub issue from ${repository}...`);
              const res = await fetchRecentIssue(repository, stateFilter);
              if (!res.success) throw new Error(res.error || "Failed to fetch GitHub issue");
              nodeResultData = res.data;
              const n = (nodeResultData as any)?.number;
              toast.success(`GitHub: loaded issue${n ? ` #${n}` : ""}`);

            } else if (nodeEvent === "github.pull_request_opened") {
              if (!repository) throw new Error("GitHub repository not configured");
              toast.info(`Fetching latest GitHub PR from ${repository}...`);
              const res = await fetchRecentPR(repository, stateFilter);
              if (!res.success) throw new Error(res.error || "Failed to fetch GitHub PR");
              nodeResultData = res.data;
              const n = (nodeResultData as any)?.number;
              toast.success(`GitHub: loaded PR${n ? ` #${n}` : ""}`);

            } else if (nodeEvent === "github.create_issue") {
              const rawTitle  = (metadata.issueTitle as string) || "";
              const rawBody   = (metadata.issueBody  as string) || "";
              const issueTitle = parseVariables(rawTitle, currentElements);
              const issueBody  = parseVariables(rawBody,  currentElements);
              const labels    = Array.isArray(metadata.selectedLabels)    ? metadata.selectedLabels    : [];
              const assignees = Array.isArray(metadata.selectedAssignees) ? metadata.selectedAssignees : [];

              if (!repository)  throw new Error("GitHub repository not configured");
              if (!issueTitle)  throw new Error("Issue title is empty");

              toast.info(`Creating GitHub issue in ${repository}...`);
              const res = await createGitHubIssue({ repository, issueTitle, issueBody, labels, assignees });
              if (!res.success) throw new Error(res.error || "Failed to create GitHub issue");
              nodeResultData = res.data;
              const n = (nodeResultData as any)?.number;
              toast.success(`GitHub: created issue${n ? ` #${n}` : ""}`);

            } else {
              // Unknown event — preserve existing sampleData so downstream variables keep resolving
              nodeResultData = metadata.sampleData ?? { status: "executed" };
              await abortableSleep(300, signal);
            }
          } else {
            await abortableSleep(800, signal);
            nodeResultData = { status: "executed" };
          }
        } catch (err: any) {
          // AbortError means the user clicked Stop — bubble up via `stopped`
          if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
            stopped = true;
          } else {
            executionError = err.message || "An error occurred";
          }
        }

        if (stopped) break;

        const isConfigured = (node.data as any)?.configStatus === "active";
        const success = !executionError && isConfigured;

        if (success) {
          currentElements = currentElements.map((el) =>
            el.id === nodeId
              ? { ...el, data: { ...el.data, metadata: { ...el.data.metadata, sampleData: nodeResultData } } }
              : el,
          );
          dispatch({ type: "UPDATE_NODE", payload: { elements: currentElements } });
          dispatch({ type: "SET_NODE_RUN_STATUS", payload: { nodeId, status: "success" } });
        } else {
          allSuccess = false;
          dispatch({ type: "SET_NODE_RUN_STATUS", payload: { nodeId, status: "error" } });
          toast.error(`${nodeName} failed: ${executionError || "Node not fully configured"}`);
          break;
        }
      }

      // User hit Stop — clear in-progress statuses and bail without deducting credit
      if (stopped || signal.aborted) {
        dispatch({ type: "CLEAR_RUN_STATUS" });
        toast.info("Workflow stopped.");
        return;
      }

      dispatch({ type: "SET_LAST_RUN_SUCCESS", payload: { success: allSuccess } });

      if (allSuccess) {
        const creditResult = await deductCredit();
        const durationMs = Date.now() - runStart;
        await onCreateWorkflowLog(workflowId, "success", "Workflow completed successfully", [], durationMs);
        if (creditResult.error) {
          toast.warning(`Workflow completed but ${creditResult.error}`);
        } else if (creditResult.remaining !== undefined) {
          toast.success(`Workflow completed! Credits remaining: ${creditResult.remaining}`);
        } else {
          toast.success("Workflow run completed successfully!");
        }
      } else {
        await onCreateWorkflowLog(workflowId, "error", "Workflow run failed", [], Date.now() - runStart);
        toast.error("Workflow run failed. Fix errors and try again.");
      }
    } finally {
      abortRef.current = null;
      dispatch({ type: "SET_RUNNING", payload: { running: false } });
    }
  }, [onFlowAutomation, getExecutionOrder, getFalseBranchIds, dispatch, state.editor.elements]);

  const onStopWorkflow = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const onPublishWorkflow = useCallback(async () => {
    setIsPublishing(true);
    const workflowId = pathname.split("/").pop()!;
    // Toggle state: if currently published, unpublish it
    const newState = !isPublished;
    const response = await onFlowPublish(workflowId, newState);

    if (response) {
      const res = response as { error?: string; message?: string };
      if (typeof response === "object" && res.error) {
        toast.error(res.error);
      } else if (typeof response === "object" && res.message) {
        toast.success(res.message);
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

      {/* Right: Guide, Support, Undo/Redo, Save, Run and Publish buttons */}
      <div className="flex items-center gap-2">
        <Link href="/docs">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            title="Guide"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden text-xs sm:inline">Guide</span>
          </Button>
        </Link>
        <a href="mailto:support@automify.com">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            title="Support"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span className="hidden text-xs sm:inline">Support</span>
          </Button>
        </a>
        <div className="w-px h-5 bg-border mx-1" />
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
          onClick={() => onFlowAutomation()}
          disabled={!hasNodes || isSaving}
          className="h-8"
          title="Save (⌘S)"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {state.editor.isRunning ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={onStopWorkflow}
            className="h-8"
            title="Stop the running workflow"
          >
            <Square className="h-3.5 w-3.5 mr-1.5 fill-current" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={onRunWorkflow}
            disabled={!hasNodes || isSaving}
            className="h-8"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Run
          </Button>
        )}
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
