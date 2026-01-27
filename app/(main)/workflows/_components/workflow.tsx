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
} from "../_actions/workflow-connections";
import { useRouter } from "next/navigation";

import { Play, Loader2, Trash2, Copy } from "lucide-react";
import EditorCanvasIconHelper from "../editor/[editorId]/_components/editor-canvas-card-icon-hepler";
import { parseVariables } from "@/lib/utils";
import { testGoogleDriveStep } from "@/app/(main)/connections/_actions/google-connection";
import { sendGmail } from "@/app/(main)/connections/_actions/google-gmail-action";
import { onDuplicateWorkflow } from "../_actions/workflow-connections";
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
        toast.success("Workflow deleted");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete workflow");
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
        toast.success("Workflow duplicated");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to duplicate workflow");
    } finally {
      setIsDuplicating(false);
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
        (n: any) => n.type === "Trigger" || n.data?.type === "Google Drive",
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

      for (const nodeId of executionOrder) {
        const node = currentElements.find((n: any) => n.id === nodeId);
        if (!node) continue;

        const nodeType = node.data?.type;
        const nodeName = node.data?.title || nodeType;
        let nodeResultData = null;

        // Simplified runner logic (reusing core concepts from editor)
        if (nodeType === "Google Drive") {
          toast.info(`Checking ${nodeName}...`);
          const result = await testGoogleDriveStep(
            node.data?.metadata?.event,
            node.data?.metadata,
          );
          if (result.error) throw new Error(`${nodeName}: ${result.error}`);
          nodeResultData = result.data || { status: "checked" };
        } else if (nodeType === "Toast Message") {
          const msg = parseVariables(
            node.data?.metadata?.message,
            currentElements,
          );
          toast(msg);
          nodeResultData = { message: msg };
        } else if (nodeType === "Email") {
          const to = parseVariables(node.data?.metadata?.to, currentElements);
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
        } else {
          await new Promise((r) => setTimeout(r, 500));
          nodeResultData = { status: "executed" };
        }

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
    <Card className="flex w-full items-center justify-between gap-4 p-5 hover:bg-accent transition-all border border-border bg-card shadow-sm rounded-xl">
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
