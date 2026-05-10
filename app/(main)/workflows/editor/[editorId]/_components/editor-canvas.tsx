"use client";

import { EditorCanvasCardType, EditorCanvasTypes, EditorNodeMetadata, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  NodeChange,
  ReactFlowInstance,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import EditorCanvasCardSingle from "./editor-canvas-card-single";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { v4 } from "uuid";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";
import FlowInstance from "./flow-instance";
import EditorCanvasSidebar from "./editor-canvas-sidebar";
import { EditorNodeActionsProvider } from "./editor-node-actions-context";

type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

type EditorCanvasProps = {
  workflowId: string;
  initialNodes: EditorNodeType[];
  initialEdges: WorkflowEdge[];
};

const nodeTypes = Object.keys(EditorCanvasDefaultCardTypes).reduce(
  (types, type) => ({ ...types, [type]: EditorCanvasCardSingle }),
  {} as Record<EditorCanvasTypes, typeof EditorCanvasCardSingle>
);

const isTriggerNodeType = (type: EditorCanvasTypes) =>
  EditorCanvasDefaultCardTypes[type]?.type === "Trigger";

const emptySelectedNode: EditorNodeType = {
  data: {
    completed: false,
    current: false,
    description: "",
    metadata: {},
    title: "",
    type: "Trigger",
  },
  id: "",
  position: { x: 0, y: 0 },
  type: "Trigger",
};

const EditorCanvas = ({ workflowId, initialNodes, initialEdges }: EditorCanvasProps) => {
  const { dispatch, state } = useEditor();
  const searchParams = useSearchParams();
  const selectedNodeId = searchParams.get("selectedNode");
  const restoredSelectedNodeId = useRef<string | null>(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // @ts-expect-error reactflow node-change types are narrower than EditorNodeType.
      setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((currentEdges) => addEdge(params, currentEdges)),
    []
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as EditorCanvasCardType["type"];

      const triggerAlreadyExists = nodes.some((node) => isTriggerNodeType(node.type));

      if (isTriggerNodeType(type) && triggerAlreadyExists) {
        toast("Only one trigger can be added to automations at the moment");
        return;
      }

      if (!reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: v4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type,
        },
      };
      setNodes((currentNodes) => currentNodes.concat(newNode));
    },
    [nodes, reactFlowInstance]
  );

  const clearSelectedNode = useCallback(() => {
    dispatch({
      type: "SELECTED_ELEMENT",
      payload: {
        element: emptySelectedNode,
      },
    });
  }, [dispatch]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      if (state.editor.selectedNode.id === nodeId) {
        clearSelectedNode();
      }

      toast.message("Node deleted");
    },
    [clearSelectedNode, state.editor.selectedNode.id]
  );

  const canDuplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId);
      const nodeKind = node ? EditorCanvasDefaultCardTypes[node.type]?.type : null;
      return Boolean(node && nodeKind !== "Trigger");
    },
    [nodes]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((currentNode) => currentNode.id === nodeId);

      if (!node) return;

      if (!canDuplicateNode(nodeId)) {
        toast.error("Only one trigger can be added to an automation");
        return;
      }

      const duplicatedNode: EditorNodeType = {
        ...node,
        id: v4(),
        selected: true,
        dragging: false,
        position: {
          x: node.position.x + 48,
          y: node.position.y + 48,
        },
        data: {
          ...node.data,
          completed: false,
          current: false,
          metadata: {
            ...node.data.metadata,
            relations: node.data.metadata.relations?.map((relation) => ({ ...relation })),
            settings: node.data.metadata.settings ? { ...node.data.metadata.settings } : undefined,
          },
        },
      };

      setNodes((currentNodes) =>
        currentNodes
          .map((currentNode) =>
            currentNode.selected ? { ...currentNode, selected: false, dragging: false } : currentNode
          )
          .concat(duplicatedNode)
      );
      dispatch({
        type: "SELECTED_ELEMENT",
        payload: {
          element: duplicatedNode,
        },
      });
      toast.message("Node duplicated");
    },
    [canDuplicateNode, dispatch, nodes]
  );

  const updateNodeMetadata = useCallback(
    (nodeId: string, metadata: Partial<EditorNodeMetadata>) => {
      const nodeToUpdate = nodes.find((node) => node.id === nodeId);
      if (!nodeToUpdate) return;

      const updatedNode = {
        ...nodeToUpdate,
        data: {
          ...nodeToUpdate.data,
          metadata: {
            ...nodeToUpdate.data.metadata,
            ...metadata,
          },
        },
      };

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  metadata: {
                    ...node.data.metadata,
                    ...metadata,
                  },
                },
              }
            : node
        )
      );

      if (state.editor.selectedNode.id === nodeId) {
        dispatch({
          type: "SELECTED_ELEMENT",
          payload: {
            element: updatedNode,
          },
        });
      }
    },
    [dispatch, nodes, state.editor.selectedNode.id]
  );

  const handleClickCanvas = () => {
    clearSelectedNode();
  };

  useEffect(() => {
    dispatch({ type: "LOAD_DATA", payload: { edges, elements: nodes } });
  }, [dispatch, edges, nodes]);

  useEffect(() => {
    if (!selectedNodeId || restoredSelectedNodeId.current === selectedNodeId) return;

    const node = nodes.find((currentNode) => currentNode.id === selectedNodeId);
    if (!node) return;

    restoredSelectedNodeId.current = selectedNodeId;
    dispatch({
      type: "SELECTED_ELEMENT",
      payload: {
        element: node,
      },
    });
  }, [dispatch, nodes, selectedNodeId]);

  return (
    <EditorNodeActionsProvider value={{ deleteNode, duplicateNode, canDuplicateNode }}>
      <ResizablePanelGroup direction="horizontal" className="min-h-0 overflow-hidden">
        <ResizablePanel defaultSize={70}>
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <ReactFlow
              className="w-[300px]"
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              fitView
              onClick={handleClickCanvas}
              nodeTypes={nodeTypes}
            >
              <Controls position="top-left" />
              <Background
                // @ts-expect-error reactflow Background variant accepts dots at runtime.
                variant="dots"
                gap={12}
                size={1}
              />
            </ReactFlow>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} className="relative min-h-0 sm:block">
          <FlowInstance workflowId={workflowId} edges={edges} nodes={nodes}>
            <EditorCanvasSidebar nodes={nodes} onUpdateNodeMetadata={updateNodeMetadata} />
          </FlowInstance>
        </ResizablePanel>
      </ResizablePanelGroup>
    </EditorNodeActionsProvider>
  );
};

export default EditorCanvas;
