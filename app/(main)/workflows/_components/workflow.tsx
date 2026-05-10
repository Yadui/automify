"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  onDeleteWorkflow,
  onFlowPublish,
  onUpdateWorkflowName,
} from "../_actions/workflow-connections";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConnectorLogo from "@/components/global/connector-logo";
import type { ConnectorType } from "@/lib/connectors";
import type { EditorCanvasTypes } from "@/lib/types";

const connectorTypes = new Set<ConnectorType>([
  "Discord",
  "Gmail",
  "GitHub",
  "Google Calendar",
  "Google Drive",
  "Notion",
  "Slack",
  "Trello",
]);

type WorkflowNodePreview = {
  type?: string;
  data?: {
    type?: string;
  };
};

const getWorkflowConnectorTypes = (nodes?: string | null) => {
  if (!nodes) return [];

  try {
    const parsed = JSON.parse(nodes) as unknown;
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(
        parsed
          .map((node: WorkflowNodePreview) => node.data?.type ?? node.type)
          .filter((type): type is ConnectorType => Boolean(type && connectorTypes.has(type as ConnectorType)))
      )
    );
  } catch {
    return [];
  }
};

type Props = {
  name: string;
  description: string;
  id: string;
  publish: boolean | null;
  nodes?: string | null;
};

const Workflow = ({ description, id, name, publish, nodes }: Props) => {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState<boolean>(publish ?? false);
  const [workflowName, setWorkflowName] = useState(name);
  const [draftName, setDraftName] = useState(name);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editorHref = `/workflows/editor/${id}`;
  const connectorLogos = useMemo(() => getWorkflowConnectorTypes(nodes), [nodes]);

  React.useEffect(() => {
    setWorkflowName(name);
    setDraftName(name);
  }, [name]);

  const handlePublishChange = async (isChecked: boolean) => {
    const response = await onFlowPublish(id, isChecked);

    if (response) {
      toast.message(response);

      // Update the state based on the success response
      setIsPublished(isChecked);
    } else {
      // Optionally revert the toggle if the operation failed
      toast.error("Failed to update the workflow state");
    }
  };

  const openRenameDialog = () => {
    setDraftName(workflowName);
    setIsRenameOpen(true);
  };

  const stopCardNavigation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleRenameSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = draftName.trim();

    if (!nextName) {
      toast.error("Workflow name is required");
      return;
    }

    setIsRenaming(true);
    try {
      const response = await onUpdateWorkflowName({ id, name: nextName });

      if (response.ok) {
        setWorkflowName(nextName);
        setIsRenameOpen(false);
        toast.message(response.message);
        router.refresh();
        return;
      }

      toast.error(response.message);
    } catch {
      toast.error("Unable to update workflow name");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await onDeleteWorkflow(id);

      if (response.ok) {
        setIsDeleteOpen(false);
        toast.message(response.message);
        router.refresh();
        return;
      }

      toast.error(response.message);
    } catch {
      toast.error("Unable to delete workflow");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className="relative flex w-full cursor-pointer flex-col justify-between gap-4 p-6 transition-colors hover:border-[#171717] sm:flex-row sm:items-center"
        onMouseEnter={() => router.prefetch(editorHref)}
      >
        <Link href={editorHref} prefetch className="absolute inset-0 z-0" aria-label={`Open ${workflowName}`} />
        <CardHeader className="relative z-10 min-w-0 p-0">
          <Link
            href={editorHref}
            prefetch
            onMouseEnter={() => router.prefetch(editorHref)}
            onFocus={() => router.prefetch(editorHref)}
            className="flex min-w-0 flex-col gap-4"
          >
            <div className="flex flex-row gap-2">
              {connectorLogos.length ? (
                connectorLogos.slice(0, 5).map((type) => (
                  <span
                    key={type}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px]"
                  >
                    <ConnectorLogo type={type as EditorCanvasTypes} title={type} size={22} />
                  </span>
                ))
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                  <ConnectorLogo type="Action" size={22} />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg tracking-[-0.32px]">{workflowName}</CardTitle>
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            </div>
          </Link>
        </CardHeader>
        <div className="relative z-20 flex flex-wrap items-center gap-2 sm:justify-end" onClick={stopCardNavigation}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Rename ${workflowName}`}
                  onClick={openRenameDialog}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rename</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${workflowName}`}
                  className="text-[#d92d20] hover:bg-[#fff3f0] hover:text-[#b42318]"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-3 pl-1">
            <Label htmlFor={`switch-${id}`} className="text-sm font-medium text-[#4d4d4d]">
              {isPublished ? "On" : "Off"}
            </Label>
            <Switch
              id={`switch-${id}`}
              onCheckedChange={handlePublishChange}
              checked={isPublished}
            />
          </div>
        </div>
      </Card>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename workflow</DialogTitle>
            <DialogDescription>Update the workflow name shown in your list.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleRenameSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`workflow-name-${id}`}>Name</Label>
              <Input
                id={`workflow-name-${id}`}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                disabled={isRenaming}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isRenaming}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isRenaming || !draftName.trim()}>
                {isRenaming ? "Saving" : "Save name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete workflow</DialogTitle>
            <DialogDescription>
              Delete {workflowName}? This removes the workflow from your list and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting" : "Delete workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Workflow;
