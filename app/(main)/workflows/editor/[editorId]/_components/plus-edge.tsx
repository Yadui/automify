"use client";
import React from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import { Plus } from "lucide-react";
import { useEditor } from "@/providers/editor-provider";

export default function AddStepEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { dispatch } = useEditor();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onAddStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "OPEN_ADD_MODAL",
      payload: {
        position: { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 },
        edgeId: id,
        sourceNodeId: source,
      },
    });
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={onAddStep}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-125 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
