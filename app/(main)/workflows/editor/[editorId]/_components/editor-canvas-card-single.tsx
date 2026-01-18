import { EditorCanvasCardType, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { useMemo, useState, useEffect } from "react";
import { Position, useNodeId } from "reactflow";
import EditorCanvasIconHelper from "./editor-canvas-card-icon-hepler";
import CustomHandle from "./custom-handle";
import { Badge } from "@/components/ui/badge";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import {
  MoreVertical,
  Plus,
  Copy,
  CopyPlus,
  Type,
  ClipboardPaste,
  MessageSquarePlus,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";

const EditorCanvasCardSingle = ({
  data,
  xPos,
  yPos,
}: {
  data: EditorCanvasCardType;
  xPos: number;
  yPos: number;
}) => {
  const { dispatch, state } = useEditor();
  const nodeId = useNodeId();
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [showErrorFlash, setShowErrorFlash] = useState(false);
  const [prevConfigStatus, setPrevConfigStatus] = useState(data.configStatus);

  // Dialog states
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(data.title);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState(data.metadata?.note || "");

  const logo = useMemo(() => {
    return <EditorCanvasIconHelper type={data.type} />;
  }, [data]);

  const isSelected = state.editor.selectedNode.id === nodeId;
  const isConfigured = data.configStatus === "active";
  const isDraft = data.configStatus === "draft";
  const isError =
    data.configStatus === "error" || data.configStatus === "needs_review";

  // Detect status changes for flash animations
  useEffect(() => {
    if (prevConfigStatus !== data.configStatus) {
      // Just turned active - show green flash
      if (data.configStatus === "active" && prevConfigStatus === "draft") {
        setShowSuccessFlash(true);
        const timer = setTimeout(() => setShowSuccessFlash(false), 3000);
        return () => clearTimeout(timer);
      }
      setPrevConfigStatus(data.configStatus);
    }
  }, [data.configStatus, prevConfigStatus]);

  // Determine border color based on state
  // Red = account not connected / error
  // Yellow = configuring (draft)
  // Green = saved and active
  const getBorderClass = () => {
    // Green flash after successful save (3 seconds)
    if (showSuccessFlash) {
      return "!border-2 !border-green-500 shadow-lg shadow-green-500/30";
    }
    // Green border when saved and active
    if (isConfigured) {
      return isSelected
        ? "!border-2 !border-green-500"
        : "!border !border-green-500/50";
    }
    // Red border if error/disconnected
    if (isError) {
      return "!border-2 !border-red-500";
    }
    // Yellow border while configuring (draft)
    if (isDraft) {
      return isSelected
        ? "!border-2 !border-yellow-500"
        : "!border !border-yellow-500/50 !border-dashed";
    }
    return "!border !border-muted-foreground/30";
  };

  const onRename = () => {
    const updatedElements = state.editor.elements.map((el) => {
      if (el.id === nodeId) {
        return {
          ...el,
          data: {
            ...el.data,
            title: newName,
          },
        };
      }
      return el;
    });
    dispatch({
      type: "UPDATE_NODE",
      payload: { elements: updatedElements },
    });
    setIsRenameOpen(false);
  };

  const onAddNote = () => {
    const updatedElements = state.editor.elements.map((el) => {
      if (el.id === nodeId) {
        return {
          ...el,
          data: {
            ...el.data,
            metadata: {
              ...el.data.metadata,
              note: newNote,
            },
          },
        };
      }
      return el;
    });
    dispatch({
      type: "UPDATE_NODE",
      payload: { elements: updatedElements },
    });
    setIsNoteOpen(false);
  };

  const onDuplicate = () => {
    if (!nodeId) return;
    const node = state.editor.elements.find((n) => n.id === nodeId);
    if (node) {
      dispatch({ type: "DUPLICATE_NODE", payload: { node } });
    }
  };

  const onCopy = () => {
    if (!nodeId) return;
    const node = state.editor.elements.find((n) => n.id === nodeId);
    if (node) {
      dispatch({ type: "COPY_NODE", payload: { node } });
    }
  };

  const onPaste = () => {
    dispatch({
      type: "PASTE_NODE",
      payload: { position: { x: xPos + 50, y: yPos + 50 } },
    });
  };

  return (
    <div className="group relative">
      {EditorCanvasDefaultCardTypes[data.type].type !== "Trigger" && (
        <CustomHandle
          type="target"
          position={Position.Top}
          style={{ zIndex: 100 }}
        />
      )}
      <Card
        onClick={(e) => {
          e.stopPropagation();
          if (!nodeId) return;
          const val = state.editor.elements.find((n) => n.id === nodeId);
          if (val)
            dispatch({
              type: "SELECTED_ELEMENT",
              payload: {
                element: val,
              },
            });
        }}
        className={clsx(
          "relative max-w-[400px] min-w-[300px] transition-all duration-300",
          getBorderClass()
        )}
      >
        <CardHeader className="flex flex-row items-center gap-4 relative pr-10">
          <div>{logo}</div>
          <div className="flex-1 overflow-hidden">
            <CardTitle className="text-md truncate pr-2">
              {data.title}
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-tighter">
                <b className="text-muted-foreground/80">ID: </b>
                {nodeId ? `${nodeId.slice(0, 8)}...` : "Unknown"}
              </p>
              {isConfigured ? (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary/80 uppercase">
                      Action:
                    </span>
                    <span className="text-xs text-foreground font-medium truncate">
                      {data.metadata?.eventLabel || "Configured"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="truncate">{data.description}</p>
              )}
              {data.metadata?.note && (
                <p className="text-[11px] text-primary italic mt-1 line-clamp-2">
                  "{data.metadata.note}"
                </p>
              )}
            </CardDescription>
          </div>

          {/* 3-dot Menu */}
          <div className="absolute right-2 top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                  <Type className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <CopyPlus className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!state.editor.clipboard}
                  onClick={onPaste}
                >
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Paste
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsNoteOpen(true)}>
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Add note
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                  onClick={() => {
                    const updatedElements = state.editor.elements.filter(
                      (n) => n.id !== nodeId
                    );
                    const updatedEdges = state.editor.edges.filter(
                      (edge) => edge.source !== nodeId && edge.target !== nodeId
                    );

                    dispatch({
                      type: "LOAD_DATA",
                      payload: {
                        elements: updatedElements,
                        edges: updatedEdges,
                      },
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Config status indicator */}
        <div
          className={clsx("absolute left-3 top-4 h-2 w-2 rounded-full", {
            "bg-green-500": isConfigured || showSuccessFlash,
            "bg-yellow-500 animate-pulse": isDraft,
            "bg-red-500": isError,
          })}
        ></div>

        {/* Run status indicator */}
        {nodeId && state.editor.runStatus[nodeId] && (
          <div className="absolute -top-3 -left-3 z-20">
            {state.editor.runStatus[nodeId] === "running" && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              </div>
            )}
            {state.editor.runStatus[nodeId] === "success" && (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {state.editor.runStatus[nodeId] === "error" && (
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                <X className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Source handle at bottom - hidden for End nodes */}
      {data.type !== "End" && (
        <CustomHandle type="source" position={Position.Bottom} id="a" />
      )}

      {/* Contextual Plus Button at the bottom of the node - hidden for End nodes and when node has outgoing edge */}
      {data.type !== "End" &&
        !state.editor.edges.some((edge) => edge.source === nodeId) && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({
                  type: "OPEN_ADD_MODAL",
                  payload: {
                    position: {
                      x: xPos,
                      y: yPos + 200, // Move it 200px down
                    },
                    sourceNodeId: nodeId || undefined,
                  },
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 transition-transform border-2 border-background"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Node</DialogTitle>
            <DialogDescription>
              Enter a new name for your workflow step.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Process Order"
              className="col-span-3"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onRename}>Save Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a brief note or description to this step for documentation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. This step handles payment verification..."
              className="col-span-3"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAddNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorCanvasCardSingle;
