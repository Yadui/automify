"use client";

import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { toast } from "sonner";
import {
  onFlowPublish,
  onDeleteWorkflow,
  onCreateWorkflowLog,
  deductCredit,
  onExportWorkflow,
} from "../_actions/workflow-connections";
import { useRouter } from "next/navigation";

import { Play, Loader2, Trash2, Copy, Download } from "lucide-react";
import EditorCanvasIconHelper from "../editor/[editorId]/_components/editor-canvas-card-icon-hepler";
import { parseVariables } from "@/lib/utils";
import { evaluateCondition } from "@/lib/workflow-utils";
import { testGoogleDriveStep } from "@/app/(main)/connections/_actions/google-connection";
import { sendGmail } from "@/app/(main)/connections/_actions/google-gmail-action";
import { onDuplicateWorkflow } from "../_actions/workflow-connections";
import axios from "axios";
import WorkflowLogs from "./workflow-logs";

type Props = {
  name: string;
  description: string;
  id: string;
  publish: boolean | null;
  nodes: any;
  edges: any;
};

const Workflow = ({ description, id, name, publish, nodes, edges }: Props) => {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Parse nodes if they are string (sometimes Prisma JSON can be stringified)
  const parsedNodes = typeof nodes === "string" ? JSON.parse(nodes) : nodes;
  const parsedEdges = typeof edges === "string" ? JSON.parse(edges) : edges;

  // Extract unique node types for the preview
  const usedNodeTypes = Array.from(
    new Set((parsedNodes || []).map((n: any) => n.data?.type)),
  ).filter(Boolean) as any[];

  const onDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await onDeleteWorkflow(id);
      if (result.success) {
        toast.success("Workflow successfully deleted.");
        router.refresh();
      } else {
        toast.error(
          result.message ||
            "We couldn't delete this workflow. Please try again.",
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the workflow.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const onDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDuplicating(true);
    try {
      const result = await onDuplicateWorkflow(id);
      if (result.success) {
        toast.success(`Workflow "${name}" duplicated successfully.`);
        router.refresh();
      } else {
        toast.error(
          result.message || "Failed to duplicate workflow. Please try again.",
        );
      }
    } catch (error) {
      toast.error("An error occurred during workflow duplication.");
    } finally {
      setIsDuplicating(false);
    }
  };

  const onExport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsExporting(true);
    try {
      const result = await onExportWorkflow(id);
      if (result.success && result.data) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_workflow.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Workflow "${name}" exported successfully!`);
      } else {
        toast.error(result.error || "Failed to export workflow.");
      }
    } catch (error) {
      toast.error("An error occurred while exporting the workflow.");
    } finally {
      setIsExporting(false);
    }
  };

  const onRun = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRunning) return;
    setIsRunning(true);
    toast.info(`Starting workflow: ${name}`);

    const nodeResults: Record<string, any> = {};

    try {
      if (!parsedNodes || parsedNodes.length === 0) {
        throw new Error("Workflow has no nodes");
      }

      // Simple execution order (Trigger nodes first)
      const triggerNodes = parsedNodes.filter(
        (n: any) =>
          n.type === "Trigger" ||
          n.type === "Google Drive" ||
          n.type === "Webhook",
      );
      const executionOrder = [...triggerNodes.map((n: any) => n.id)];

      // BFS for other nodes
      const queue = [...executionOrder];
      const visited = new Set(executionOrder);

      while (queue.length > 0) {
        const currentId = queue.shift();
        const targets = parsedEdges
          .filter((edge: any) => edge.source === currentId)
          .map((edge: any) => edge.target);

        for (const target of targets) {
          if (!visited.has(target)) {
            visited.add(target);
            executionOrder.push(target);
            queue.push(target);
          }
        }
      }

      let currentElements = [...parsedNodes];

      const nodeStatus: Record<string, "pending" | "executed" | "skipped"> = {};
      executionOrder.forEach((id) => (nodeStatus[id] = "pending"));

      for (const nodeId of executionOrder) {
        if (nodeStatus[nodeId] === "skipped") continue;

        const node = currentElements.find((n: any) => n.id === nodeId);
        if (!node) continue;

        const nodeType = node.data?.type;
        const nodeName = node.data?.title || nodeType;
        let nodeResultData = null;

        // RETRY LOGIC: 3 attempts with exponential backoff
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let lastError = null;

        while (attempts < maxAttempts && !success) {
          try {
            attempts++;
            if (attempts > 1) {
              const backoff = Math.pow(2, attempts - 1) * 1000;
              toast.info(
                `Retrying ${nodeName} (Attempt ${attempts}/${maxAttempts})...`,
              );
              await new Promise((r) => setTimeout(r, backoff));
            }

            // Simplified runner logic
            if (nodeType === "Google Drive") {
              const result = await testGoogleDriveStep(
                node.data?.metadata?.event,
                node.data?.metadata,
              );
              if (result.error) throw new Error(result.error);
              nodeResultData = result.data || { status: "checked" };
            } else if (nodeType === "Condition") {
              const metadata = node.data?.metadata;
              const finalResult = evaluateCondition(
                metadata?.conditions || [],
                metadata?.rootLogic || "AND",
                currentElements,
              );

              nodeResultData = { result: finalResult };
              toast.info(
                `${nodeName} evaluated to ${finalResult ? "TRUE" : "FALSE"}`,
              );

              // Handle Branching: Skip the invalid branch
              const handleToSkip = finalResult ? "false" : "true";

              const skipBranch = (startNodeId: string, handleId: string) => {
                const edgesToSkip = parsedEdges.filter(
                  (e: any) =>
                    e.source === startNodeId && e.sourceHandle === handleId,
                );

                edgesToSkip.forEach((edge: any) => {
                  const targetId = edge.target;
                  if (nodeStatus[targetId] !== "executed") {
                    nodeStatus[targetId] = "skipped";
                    // Recursively skip downstream
                    const downstreamEdges = parsedEdges.filter(
                      (e: any) => e.source === targetId,
                    );
                    downstreamEdges.forEach((de: any) =>
                      skipBranch(targetId, de.sourceHandle),
                    );
                  }
                });
              };

              skipBranch(nodeId, handleToSkip);
            } else if (nodeType === "Toast Message") {
              const msg = parseVariables(
                node.data?.metadata?.message,
                currentElements,
              );
              toast(msg);
              nodeResultData = { message: msg };
            } else if (nodeType === "Email") {
              const to = parseVariables(
                node.data?.metadata?.to,
                currentElements,
              );
              const subject = parseVariables(
                node.data?.metadata?.subject,
                currentElements,
              );
              const message = parseVariables(
                node.data?.metadata?.message,
                currentElements,
              );

              if (!to) throw new Error("Recipient missing in Email node");
              const res = await sendGmail({ to, subject, message });
              if (!res.success) throw new Error(res.error || "Email failed");
              nodeResultData = res.data;
            } else if (nodeType === "Wait") {
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
                await new Promise((r) => setTimeout(r, waitMs));
              } else if (waitConfig?.type === "until_time") {
                const targetTime = new Date(waitConfig.datetime).getTime();
                const now = Date.now();
                waitMs = Math.max(0, targetTime - now);

                if (waitMs > 0) {
                  const targetDate = new Date(waitConfig.datetime);
                  toast.info(`Waiting until ${targetDate.toLocaleString()}...`);
                  await new Promise((r) => setTimeout(r, waitMs));
                } else {
                  toast.info(
                    "Target time already passed, continuing immediately.",
                  );
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
              const rawUrl = parseVariables(
                metadata.url || "",
                currentElements,
              );

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
                requestHeaders[metadata.apiKeyName || "X-API-Key"] =
                  parseVariables(metadata.apiKeyValue, currentElements);
              } else if (
                metadata.authType === "bearer" &&
                metadata.bearerToken
              ) {
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
              const finalUrl = queryString
                ? `${rawUrl}?${queryString}`
                : rawUrl;

              // Parse body if present
              let bodyData;
              if (["POST", "PUT", "PATCH"].includes(method) && metadata.body) {
                try {
                  const parsedBody = parseVariables(
                    metadata.body,
                    currentElements,
                  );
                  bodyData = JSON.parse(parsedBody);
                } catch {
                  bodyData = metadata.body;
                }
              }

              toast.info(`Executing ${method} request...`);
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
              await new Promise((r) => setTimeout(r, 500));
              nodeResultData = { status: "executed" };
            }

            success = true;
          } catch (err: any) {
            lastError = err;
            if (attempts >= maxAttempts) {
              throw new Error(
                `${nodeName} failed after ${maxAttempts} attempts: ${err.message}`,
              );
            }
          }
        }

        nodeStatus[nodeId] = "executed";
        nodeResults[nodeId] = nodeResultData;

        // Update current elements for variable resolution
        currentElements = currentElements.map((el) =>
          el.id === nodeId
            ? {
                ...el,
                data: {
                  ...el.data,
                  metadata: { ...el.data.metadata, sampleData: nodeResultData },
                },
              }
            : el,
        );
      }
      toast.success(`Workflow "${name}" executed successfully!`);

      // Deduct credit on successful run
      const creditResult = await deductCredit();
      if (creditResult.remaining !== undefined) {
        toast.info(`Credits remaining: ${creditResult.remaining}`);
      }

      await onCreateWorkflowLog(
        id,
        "Success",
        "Manual execution completed successfully",
        nodeResults,
      );
    } catch (err: any) {
      toast.error(`Workflow failed: ${err.message}`);
      await onCreateWorkflowLog(id, "Failure", err.message, nodeResults);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card
      className="flex w-full items-center justify-between gap-4 p-5 hover:bg-accent transition-all border border-border bg-card shadow-sm rounded-xl"
      onMouseEnter={() => {
        router.prefetch(`/workflows/editor/${id}`);
      }}
    >
      <Link href={`/workflows/editor/${id}`} className="flex-1">
        <CardHeader className="p-0 flex flex-col gap-4">
          <div className="flex flex-row items-center -space-x-3">
            {usedNodeTypes.length > 0 ? (
              usedNodeTypes.map((type, i) => (
                <div
                  key={type}
                  className="bg-background w-10 h-10 rounded-full border-2 border-background shadow-sm flex items-center justify-center overflow-hidden z-[i]"
                  style={{ zIndex: usedNodeTypes.length - i }}
                >
                  <div className="scale-75">
                    <EditorCanvasIconHelper type={type} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic">
                No nodes configured
              </div>
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              {name}
            </CardTitle>
            <CardDescription className="line-clamp-1 text-sm opacity-70">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Link>

      <div className="flex items-center gap-3">
        <WorkflowLogs workflowId={id} />
        <Button
          onClick={onDuplicate}
          disabled={isDuplicating}
          size="sm"
          className="rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300 transition-all shadow-sm border-none h-10 w-10 flex items-center justify-center p-0"
        >
          {isDuplicating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={onExport}
          disabled={isExporting}
          size="sm"
          className="rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300 transition-all shadow-sm border-none h-10 w-10 flex items-center justify-center p-0"
          title="Export workflow"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={onDelete}
          onMouseLeave={() => setDeleteConfirm(false)}
          disabled={isDeleting}
          size="sm"
          className={clsx(
            "group rounded-full font-bold transition-all duration-2000 ease-in-out shadow-sm border-none h-10 overflow-hidden w-10 hover:w-auto hover:px-4",
            deleteConfirm
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-red-300 text-red-900 hover:bg-red-400",
          )}
        >
          <div className="flex items-center justify-center whitespace-nowrap">
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                <span className="overflow-hidden w-0 group-hover:w-auto group-hover:ml-2 transition-all duration-2000 ease-in-out">
                  {deleteConfirm ? "Really delete?" : "Delete"}
                </span>
              </>
            )}
          </div>
        </Button>
        <Button
          onClick={onRun}
          disabled={isRunning}
          size="sm"
          className={clsx(
            "rounded-full px-8 font-bold transition-all shadow-sm border-none h-10",
            isRunning
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2 fill-current" />
          )}
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
    </Card>
  );
};

export default Workflow;
