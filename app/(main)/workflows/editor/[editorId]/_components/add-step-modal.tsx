"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditor } from "@/providers/editor-provider";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";
import { EditorCanvasTypes, EditorNodeType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import EditorCanvasIconHelper from "./editor-canvas-card-icon-hepler";
import { v4 } from "uuid";
import { toast } from "sonner";

const AddStepModal = () => {
  const { state, dispatch } = useEditor();
  const [search, setSearch] = useState("");

  const filteredApps = Object.entries(EditorCanvasDefaultCardTypes).filter(
    ([name]) => name.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectApp = (type: string, app: any) => {
    // Calculate proper position for the new node
    let nodePosition = state.editor.addModalPosition;

    // If splitting an edge, position node between source and target
    if (state.editor.activeEdgeId) {
      const edge = state.editor.edges.find(
        (e) => e.id === state.editor.activeEdgeId
      );
      if (edge) {
        const sourceNode = state.editor.elements.find(
          (n) => n.id === edge.source
        );
        const targetNode = state.editor.elements.find(
          (n) => n.id === edge.target
        );
        if (sourceNode && targetNode) {
          // Position new node between source and target
          nodePosition = {
            x: (sourceNode.position.x + targetNode.position.x) / 2,
            y: (sourceNode.position.y + targetNode.position.y) / 2,
          };
          // Also shift the target node down to make room
          const shiftAmount = 150; // Pixels to shift target node down
          targetNode.position.y += shiftAmount;
        }
      }
    }

    const newNode: EditorNodeType = {
      id: v4(),
      type: type as EditorCanvasTypes,
      position: nodePosition,
      data: {
        title: type,
        description: app.description,
        completed: false,
        current: false,
        metadata: {},
        type: type as EditorCanvasTypes,
        configStatus: "draft",
      },
    };

    // Rule: Only one Trigger allowed. If adding another, replace old one.
    let newElements = [...state.editor.elements];
    if (newNode.type === "Trigger" || newNode.type === "Google Drive") {
      newElements = newElements.filter(
        (el) => el.type !== "Trigger" && el.type !== "Google Drive"
      );
    }

    let newEdges = [...state.editor.edges];
    if (state.editor.activeEdgeId) {
      const splitEdge = newEdges.find(
        (e) => e.id === state.editor.activeEdgeId
      );
      if (splitEdge) {
        newEdges = newEdges.filter((e) => e.id !== state.editor.activeEdgeId);
        newEdges.push(
          { id: v4(), source: splitEdge.source, target: newNode.id },
          { id: v4(), source: newNode.id, target: splitEdge.target }
        );
      }
    } else if (state.editor.sourceNodeId) {
      newEdges.push({
        id: v4(),
        source: state.editor.sourceNodeId,
        target: newNode.id,
      });
    }

    dispatch({
      type: "LOAD_DATA",
      payload: {
        //@ts-ignore
        elements: [...newElements, newNode],
        edges: newEdges,
      },
    });

    dispatch({
      type: "SELECTED_ELEMENT",
      payload: {
        element: newNode,
      },
    });

    dispatch({ type: "CLOSE_ADD_MODAL" });
    toast.success(`${type} added to workflow`);
  };

  return (
    <Dialog
      open={state.editor.isAddModalOpen}
      onOpenChange={() => dispatch({ type: "CLOSE_ADD_MODAL" })}
    >
      <DialogContent className="sm:max-w-[600px] border-none bg-background/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add Step
          </DialogTitle>
        </DialogHeader>
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
          {filteredApps.map(([name, app]) => (
            <div
              key={name}
              onClick={() => onSelectApp(name, app)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-muted bg-card hover:bg-accent hover:border-primary transition-all cursor-pointer group"
            >
              <div className="mb-3 p-3 rounded-lg bg-background group-hover:scale-110 transition-transform">
                <EditorCanvasIconHelper type={name as EditorCanvasTypes} />
              </div>
              <span className="text-sm font-medium text-center">{name}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStepModal;
