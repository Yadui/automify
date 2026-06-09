"use client";

import { EditorCanvasCardType, EditorCanvasTypes, EditorNodeMetadata, EditorNodeType } from "@/lib/types";
import {
  getConnector,
  isConnectorType,
  isSupportedConnectorRelationPair,
  type ConnectorRelationInput,
  type ConnectorType,
} from "@/lib/connectors";
import { useEditor } from "@/providers/editor-provider";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import EditorHeader from "./editor-header";
import { EditorNodeActionsProvider } from "./editor-node-actions-context";
import { Loader2 } from "lucide-react";

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

const getNodeConnectorType = (node: EditorNodeType | undefined): ConnectorType | null => {
  if (!node) return null;
  const candidate = node.data.title || node.type;
  return isConnectorType(candidate) ? candidate : null;
};

// Builds the default connector relations that should be created when a source
// node is connected to a target node, based on the connector registry presets.
const buildRelationsForConnection = (
  source: EditorNodeType | undefined,
  target: EditorNodeType | undefined
): ConnectorRelationInput[] => {
  const sourceConnectorType = getNodeConnectorType(source);
  const targetConnectorType = getNodeConnectorType(target);

  if (!source || !target || !sourceConnectorType || !targetConnectorType) return [];

  if (!isSupportedConnectorRelationPair({ sourceConnectorType, targetConnectorType })) {
    return [];
  }

  return getConnector(sourceConnectorType)
    .relations.defaultSourceMappings.filter(
      (mapping) =>
        mapping.sourceConnectorType === sourceConnectorType &&
        mapping.targetConnectorType === targetConnectorType
    )
    .map((mapping) => ({
      sourceConnectorType,
      targetConnectorType,
      settingsKey: mapping.settingsKey,
      value: mapping.required ? "" : undefined,
      sourceNodeId: source.id,
      targetNodeId: target.id,
    })) as ConnectorRelationInput[];
};

const mergeRelations = (
  existing: ConnectorRelationInput[] | undefined,
  additions: ConnectorRelationInput[]
): ConnectorRelationInput[] => {
  const current = existing ?? [];
  const isDuplicate = (relation: ConnectorRelationInput) =>
    current.some(
      (candidate) =>
        candidate.settingsKey === relation.settingsKey &&
        candidate.targetNodeId === relation.targetNodeId
    );

  const newRelations = additions.filter((relation) => !isDuplicate(relation));
  return newRelations.length > 0 ? [...current, ...newRelations] : current;
};

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

// Reads ?selectedNode=<id> from the URL and restores the selected node in
// EditorContext on mount / URL change. Isolated in its own component so the
// useSearchParams() call sits under a <Suspense> boundary (Next.js 15 requirement).
const SearchParamsSyncer = ({ nodes }: { nodes: EditorNodeType[] }) => {
  const { dispatch } = useEditor();
  const searchParams = useSearchParams();
  const selectedNodeId = searchParams.get("selectedNode");
  const restoredSelectedNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedNodeId || restoredSelectedNodeId.current === selectedNodeId) return;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;
    restoredSelectedNodeId.current = selectedNodeId;
    dispatch({ type: "SELECTED_ELEMENT", payload: { element: node } });
  }, [dispatch, nodes, selectedNodeId]);

  return null;
};

const EditorCanvas = ({ workflowId, initialNodes, initialEdges }: EditorCanvasProps) => {
  const { dispatch, state } = useEditor();
  const isRunning = state.editor.isRunning;
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();

  // Mirror frequently-changing state into refs so event handlers can stay
  // referentially stable. Without this, `nodes`/`edges` in dependency arrays
  // would recreate the handlers on every drag frame, forcing all node cards
  // (via EditorNodeActionsProvider) to re-render while dragging or panning.
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const selectedNodeIdRef = useRef(state.editor.selectedNode.id);
  // Keep clipboard in a ref so pasteNode stays referentially stable.
  const clipboardRef = useRef(state.editor.clipboard);
  // Keep the RF instance in a ref so addNode stays referentially stable.
  const reactFlowInstanceRef = useRef(reactFlowInstance);
  /**
   * Tracks the last `nodes` array we synced INTO EditorContext via LOAD_DATA.
   * When `state.editor.elements` differs from this ref it means a wizard
   * dispatched UPDATE_NODE from outside React Flow, so we need to mirror the
   * data back into `nodes` (reverse sync).
   * Null before the first LOAD_DATA fires — reverse sync is skipped until then.
   */
  const rfSyncedElementsRef = useRef<EditorNodeType[] | null>(null);
  nodesRef.current = nodes;
  edgesRef.current = edges;
  selectedNodeIdRef.current = state.editor.selectedNode.id;
  clipboardRef.current = state.editor.clipboard;
  reactFlowInstanceRef.current = reactFlowInstance;

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // ReactFlow v11 fires { type:"dimensions" } on every re-render even when
      // width/height haven't changed.  applyNodeChanges always creates new objects,
      // so if we process stale dimension events we get a new `nodes` array reference
      // → forward sync dispatches LOAD_DATA → history push → context re-render
      // → ReactFlow re-renders → same dimension events → infinite loop.
      // Fix: skip dimension changes whose values are already stored on the node.
      const meaningful = changes.filter((change) => {
        if (change.type !== "dimensions") return true;
        const node = nodesRef.current.find((n) => n.id === change.id);
        if (!node || !change.dimensions) return true;
        const n = node as EditorNodeType & { width?: number; height?: number };
        return (
          n.width !== change.dimensions.width ||
          n.height !== change.dimensions.height
        );
      });
      if (meaningful.length === 0) return;
      // @ts-expect-error reactflow node-change types are narrower than EditorNodeType.
      setNodes((currentNodes) => applyNodeChanges(meaningful, currentNodes));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removedEdgeIds = changes
        .filter((change): change is Extract<EdgeChange, { type: "remove" }> => change.type === "remove")
        .map((change) => change.id);

      if (removedEdgeIds.length > 0) {
        const removedPairs = edgesRef.current
          .filter((edge) => removedEdgeIds.includes(edge.id))
          .map((edge) => ({ source: edge.source, target: edge.target }));

        if (removedPairs.length > 0) {
          setNodes((currentNodes) =>
            currentNodes.map((node) => {
              const targetsToRemove = removedPairs
                .filter((pair) => pair.source === node.id)
                .map((pair) => pair.target);

              if (targetsToRemove.length === 0) return node;

              const existingRelations = node.data.metadata.relations;
              if (!existingRelations || existingRelations.length === 0) return node;

              const nextRelations = existingRelations.filter(
                (relation) =>
                  !relation.targetNodeId || !targetsToRemove.includes(relation.targetNodeId)
              );

              if (nextRelations.length === existingRelations.length) return node;

              return {
                ...node,
                data: {
                  ...node.data,
                  metadata: {
                    ...node.data.metadata,
                    relations: nextRelations,
                  },
                },
              };
            })
          );
        }
      }

      setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((currentEdges) => addEdge(params, currentEdges));

      if (!params.source || !params.target) return;

      setNodes((currentNodes) => {
        const source = currentNodes.find((node) => node.id === params.source);
        const target = currentNodes.find((node) => node.id === params.target);
        const relations = buildRelationsForConnection(source, target);

        if (relations.length === 0) return currentNodes;

        return currentNodes.map((node) => {
          if (node.id !== source?.id) return node;

          const mergedRelations = mergeRelations(node.data.metadata.relations, relations);
          if (mergedRelations === node.data.metadata.relations) return node;

          return {
            ...node,
            data: {
              ...node.data,
              metadata: {
                ...node.data.metadata,
                relations: mergedRelations,
              },
            },
          };
        });
      });
    },
    []
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as EditorCanvasCardType["type"];

      const triggerAlreadyExists = nodesRef.current.some((node) => isTriggerNodeType(node.type));

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
    [reactFlowInstance]
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
      setNodes((currentNodes) =>
        currentNodes
          .filter((node) => node.id !== nodeId)
          .map((node) => {
            const existingRelations = node.data.metadata.relations;
            if (!existingRelations || existingRelations.length === 0) return node;

            const nextRelations = existingRelations.filter(
              (relation) =>
                relation.sourceNodeId !== nodeId && relation.targetNodeId !== nodeId
            );

            if (nextRelations.length === existingRelations.length) return node;

            return {
              ...node,
              data: {
                ...node.data,
                metadata: {
                  ...node.data.metadata,
                  relations: nextRelations,
                },
              },
            };
          })
      );
      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      if (selectedNodeIdRef.current === nodeId) {
        clearSelectedNode();
      }

      toast.message("Node deleted");
    },
    [clearSelectedNode]
  );

  const canDuplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((currentNode) => currentNode.id === nodeId);
      const nodeKind = node ? EditorCanvasDefaultCardTypes[node.type]?.type : null;
      return Boolean(node && nodeKind !== "Trigger");
    },
    []
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodesRef.current.find((currentNode) => currentNode.id === nodeId);

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
    [canDuplicateNode, dispatch]
  );

  /**
   * Shallow-merge `partialData` into a node's `.data` via `setNodes`.
   * This is the correct way to update title, note, or any card-level data
   * because it keeps React Flow's local state as the source of truth.
   */
  const updateNodeData = useCallback(
    (nodeId: string, partialData: Partial<EditorCanvasCardType>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...partialData } }
            : node
        )
      );
    },
    []
  );

  /**
   * Paste the clipboard node at `position` via `setNodes`.
   * Reads clipboard from `clipboardRef` so this callback stays stable.
   */
  const pasteNode = useCallback(
    (position: { x: number; y: number }) => {
      const clipboard = clipboardRef.current;
      if (!clipboard) return;

      const isTrigger = isTriggerNodeType(clipboard.type);
      if (isTrigger && nodesRef.current.some((n) => isTriggerNodeType(n.type))) {
        toast.error("Only one trigger can be added to an automation");
        return;
      }

      const newNode: EditorNodeType = {
        ...clipboard,
        id: v4(),
        position,
        selected: true,
        dragging: false,
        data: {
          ...clipboard.data,
          completed: false,
          current: false,
          metadata: {
            ...clipboard.data.metadata,
            relations: clipboard.data.metadata?.relations?.map((r) => ({ ...r })),
          },
        },
      };

      setNodes((currentNodes) =>
        currentNodes
          .map((n) => (n.selected ? { ...n, selected: false, dragging: false } : n))
          .concat(newNode)
      );
      dispatch({ type: "SELECTED_ELEMENT", payload: { element: newNode } });
      toast.message("Node pasted");
    },
    [dispatch]
  );

  /**
   * Add a node to the canvas without drag-and-drop (e.g. double-click in palette).
   *
   * Position rules:
   *  - Canvas empty → 25 % of the canvas element's height, horizontally centred,
   *    converted to flow-space via `screenToFlowPosition`.
   *  - Canvas has nodes → 200 px below the lowest node in flow-space, at the
   *    average X of all existing nodes.
   */
  const addNode = useCallback(
    (type: EditorCanvasTypes) => {
      if (isTriggerNodeType(type) && nodesRef.current.some((n) => isTriggerNodeType(n.type))) {
        toast.error("Only one trigger can be added to an automation");
        return;
      }

      let position: { x: number; y: number };

      if (nodesRef.current.length === 0) {
        // Empty canvas — use the RF instance to map screen → flow coords.
        const rf = reactFlowInstanceRef.current;
        const canvasEl = document.querySelector(".react-flow") as HTMLElement | null;
        if (rf && canvasEl) {
          const rect = canvasEl.getBoundingClientRect();
          position = rf.screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height * 0.25,
          });
        } else {
          position = { x: 0, y: 0 };
        }
      } else {
        // Non-empty — place 200 px below the lowest node, at the average X.
        const avgX =
          nodesRef.current.reduce((sum, n) => sum + n.position.x, 0) /
          nodesRef.current.length;
        const maxY = Math.max(...nodesRef.current.map((n) => n.position.y));
        position = { x: avgX, y: maxY + 200 };
      }

      const newNode: EditorNodeType = {
        id: v4(),
        type,
        position,
        selected: true,
        dragging: false,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type,
        },
      };

      setNodes((current) =>
        current
          .map((n) => (n.selected ? { ...n, selected: false, dragging: false } : n))
          .concat(newNode)
      );
      dispatch({ type: "SELECTED_ELEMENT", payload: { element: newNode } });
      toast.success(`${type} added`);
    },
    [dispatch]
  );

  const updateNodeMetadata = useCallback(
    (nodeId: string, metadata: Partial<EditorNodeMetadata>) => {
      const nodeToUpdate = nodesRef.current.find((node) => node.id === nodeId);
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

      if (selectedNodeIdRef.current === nodeId) {
        dispatch({
          type: "SELECTED_ELEMENT",
          payload: {
            element: updatedNode,
          },
        });
      }
    },
    [dispatch]
  );

  const handleClickCanvas = useCallback(() => {
    clearSelectedNode();
  }, [clearSelectedNode]);

  // On initial load, centre the canvas around pre-existing nodes.
  // We call fitView() exactly once – only when the workflow already has nodes
  // (i.e. a reload / re-open). For a brand-new empty canvas we do nothing so
  // the viewport stays at the default position. Adding nodes later never
  // re-triggers onInit, so the previous "zoom-in on first drop" bug is gone.
  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      if (initialNodes.length > 0) {
        // Defer by one frame so ReactFlow has finished measuring node sizes.
        // maxZoom: 1 keeps the default zoom level – we only pan to centre the
        // nodes, never zoom in past 1×.
        setTimeout(() => instance.fitView({ padding: 0.2, maxZoom: 1 }), 50);
      }
    },
    // initialNodes is the stable prop value from mount – safe with empty deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const nodeActions = useMemo(
    () => ({ deleteNode, duplicateNode, canDuplicateNode, updateNodeData, pasteNode, addNode }),
    [deleteNode, duplicateNode, canDuplicateNode, updateNodeData, pasteNode, addNode]
  );

  // ── Forward sync: React Flow local state → EditorContext ─────────────────────
  useEffect(() => {
    // Record what we're about to write so the reverse sync can detect echoes.
    rfSyncedElementsRef.current = nodes;
    dispatch({ type: "LOAD_DATA", payload: { edges, elements: nodes } });
  }, [dispatch, edges, nodes]);

  // ── Reverse sync: EditorContext → React Flow local state ───────────────────
  // Fires when a wizard calls dispatch(UPDATE_NODE) to set configStatus/metadata.
  // That dispatch updates state.editor.elements to a NEW reference that differs
  // from what we last synced FROM React Flow.  We patch only `.data` on each
  // node so position/selected/dragging are never overwritten by the context.
  useEffect(() => {
    // Skip until the forward sync has run at least once.
    if (rfSyncedElementsRef.current === null) return;
    // Skip echoes — when LOAD_DATA stored `nodes` into the context, the
    // reference is identical to rfSyncedElementsRef.current (same array).
    if ((state.editor.elements as unknown) === (rfSyncedElementsRef.current as unknown)) return;

    setNodes((currentNodes) => {
      let anyChanged = false;
      const next = currentNodes.map((node) => {
        const updated = state.editor.elements.find((el) => el.id === node.id);
        if (!updated || updated.data === node.data) return node;
        anyChanged = true;
        return { ...node, data: updated.data };
      });
      // Return the SAME reference when nothing changed — React will bail out of
      // the re-render, breaking any residual forward ↔ reverse sync cycle.
      return anyChanged ? next : currentNodes;
    });
  }, [state.editor.elements]);

  return (
    <EditorNodeActionsProvider value={nodeActions}>
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <SearchParamsSyncer nodes={nodes} />
        </Suspense>
        <EditorHeader />
        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1 overflow-hidden">
        <ResizablePanel defaultSize={70}>
          <div className="relative h-full w-full overflow-hidden">
            {isRunning && (
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2 bg-primary/90 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running workflow…
              </div>
            )}
            <ReactFlow
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
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
        {!isRunning && <ResizableHandle />}
        {!isRunning && (
          <ResizablePanel defaultSize={30} className="relative min-h-0 sm:block">
            <FlowInstance workflowId={workflowId} edges={edges} nodes={nodes}>
              <EditorCanvasSidebar nodes={nodes} onUpdateNodeMetadata={updateNodeMetadata} />
            </FlowInstance>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      </div>
    </EditorNodeActionsProvider>
  );
};

export default EditorCanvas;
