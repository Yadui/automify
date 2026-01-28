"use client";
import { EditorCanvasCardType, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  reconnectEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges, // Add getConnectedEdges
} from "reactflow";
import "reactflow/dist/style.css";
import EditorCanvasCardSingle from "./editor-canvas-card-single";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { v4 } from "uuid";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";
import FlowInstance from "./flow-instance";
import EditorCanvasSidebar from "./editor-canvas-sidebar";
import { onGetNodesEdges } from "../../../_actions/workflow-connections";
import AddStepModal from "./add-step-modal";
import PlusEdge from "./plus-edge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialNodes: EditorNodeType[] = [];

const initialEdges: { id: string; source: string; target: string }[] = [];

const EditorCanvas = () => {
  const { dispatch, state } = useEditor();
  // Helper to find closest handle

  // Actually, I'll inline the logic in onNodeDrag or create a proper helper outside the component or inside.
  // Let's add the helper function and state for temp edge.
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  // Removed local loading state as data is now injected via EditorProvider
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const pathname = usePathname();

  // Proximity Connect State
  const MIN_DISTANCE = 150;

  const getClosestHandle = useCallback(
    (pos: { x: number; y: number }) => {
      if (!reactFlowInstance) return null;
      // We need to iterate over all nodes and their handles
      // Since we don't have easy access to handle positions directly without internal state
      // We will approximate using node centers or known handle positions if possible
      // Alternatively, use reactFlowInstance.getNodes() and iterate

      // For simplicity, let's assume handles are close to node centers or standard positions
      // Detailed implementation requires internal handle bounds which `reactflow` 11 exposes via useStore or similar
      // BUT the example given usually iterates all nodes

      // Let's use getNodes() from instance
      const nodes = reactFlowInstance.getNodes();
      let closestHandle = null;
      let minDistance = MIN_DISTANCE;

      nodes.forEach((node) => {
        // Skip current dragging node? handled in caller
        // Calculate distance from pos to node center/handles
        const dx = node.position.x - pos.x;
        const dy = node.position.y - pos.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDistance) {
          minDistance = d;
          closestHandle = { nodeId: node.id, distance: d };
        }
      });
      return closestHandle;
    },
    [reactFlowInstance],
  );

  const onNodeDrag = useCallback(
    (_: any, node: EditorNodeType) => {
      const closeHandle = getClosestHandle(node, nodes);

      if (closeHandle) {
        setEdges((eds) => {
          const nextEdges = eds.filter((e) => e.className !== "temp");

          if (
            closeHandle.nodeId !== node.id &&
            !nextEdges.find(
              (e) =>
                e.source === e.target ||
                (e.source === node.id && e.target === closeHandle.nodeId) ||
                (e.target === node.id && e.source === closeHandle.nodeId),
            )
          ) {
            const tempEdge: Edge = {
              id: "temp-edge",
              source: closeHandle.nodeId,
              target: node.id,
              className: "temp",
              animated: true,
              style: { strokeDasharray: "5,5" },
            };
            return [...nextEdges, tempEdge];
          }
          return nextEdges;
        });
      }
    },
    [getClosestHandle, nodes, setEdges],
  );

  const onNodeDragStop = useCallback(
    (_: any, node: EditorNodeType) => {
      const closeHandle = getClosestHandle(node, nodes);

      if (closeHandle && closeHandle.distance < MIN_DISTANCE) {
        setEdges((eds) => {
          const validEdges = eds.filter((e) => e.className !== "temp");

          // Avoid self-loops and duplicates
          if (
            closeHandle.nodeId === node.id ||
            validEdges.find(
              (e) =>
                (e.source === node.id && e.target === closeHandle.nodeId) ||
                (e.target === node.id && e.source === closeHandle.nodeId),
            )
          ) {
            return validEdges;
          }

          const newEdge: Edge = {
            id: `${closeHandle.nodeId}-${node.id}`,
            source: closeHandle.nodeId,
            target: node.id,
            type: "plus-edge",
          };
          return addEdge(newEdge, validEdges);
        });
      } else {
        // Clean up temp edge if dropped far
        setEdges((eds) => eds.filter((e) => e.className !== "temp"));
      }
    },
    [getClosestHandle, nodes, setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes to global state
      const updatedNodes = applyNodeChanges(
        changes,
        state.editor.elements as any,
      ) as EditorNodeType[];
      dispatch({
        type: "LOAD_DATA",
        payload: { edges: state.editor.edges, elements: updatedNodes },
      });
      // Also update local state for sync
      setNodes(updatedNodes);
    },
    [state.editor.elements, state.editor.edges, dispatch],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow",
      ) as EditorCanvasCardType["type"];

      const triggerAlreadyExists = state.editor.elements.find(
        (node) => node.type === "Trigger",
      );

      if (type === "Trigger" && triggerAlreadyExists) {
        toast("Only one trigger can be added to automations at the moment");
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
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
          type: type,
        },
      };
      //@ts-ignore
      setNodes((nds) => nds.concat(newNode)); // setNodes((nds) => [...nds, newNode])
    },
    [reactFlowInstance, state],
  );

  const handleClickCanvas = () => {
    dispatch({
      type: "SELECTED_ELEMENT",
      payload: {
        element: {
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
        },
      },
    });
  };

  const onReconnectStart = useCallback(() => {
    // console.log("onReconnectStart");
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges],
  );

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted: EditorNodeType[]) => {
      setEdges((deletedEdges) => {
        const remainingEdges = deletedEdges.reduce((acc, edge) => {
          // If edge is connected to deleted node, don't include it
          const isConnectedToDeleted = deleted.some(
            (node) => node.id === edge.source || node.id === edge.target,
          );
          if (!isConnectedToDeleted) {
            return [...acc, edge];
          }
          return acc;
        }, [] as Edge[]);

        const createdEdges = deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, deletedEdges);
          const outgoers = getOutgoers(node, nodes, deletedEdges);
          const connectedEdges = getConnectedEdges([node], deletedEdges);
          const remaining = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const created = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
              type: "plus-edge", // Maintain edge type consistency
            })),
          );

          return [...remaining, ...created];
        }, remainingEdges);

        return createdEdges;
      });
    },
    [nodes, setEdges],
  );

  // Sync local nodes with global state when elements change (e.g., from modal OR deletion)
  useEffect(() => {
    // We check if the lengths differ or content might have changed.
    // Simplifying: Always sync if state.editor.elements changes.
    // To avoid unnecessary re-renders/loops, we can rely on React's state setter optimization or add a JSON stringify check if needed.
    // Given the bug was specifically about deletion (length decreases), we simple remove the '> nodes.length' check.
    setNodes(state.editor.elements as EditorNodeType[]);
  }, [state.editor.elements]);

  // Sync global edges to local state (for modal edge updates)
  useEffect(() => {
    // Check if global edges differ from local (edge was split by modal)
    // Also sync on initial load
    if (
      state.editor.edges.length !== edges.length ||
      (state.editor.edges.length > 0 && edges.length === 0)
    ) {
      setEdges(state.editor.edges);
    }
  }, [state.editor.edges]);

  // Sync local edges to global state
  useEffect(() => {
    if (edges.length > 0 || state.editor.edges.length === 0) {
      // Avoid dispatching if local state matches global state (prevent loops)
      if (edges.length !== state.editor.edges.length && edges.length > 0) {
        dispatch({ type: "LOAD_DATA", payload: { edges, elements: nodes } });
      }
    }
  }, [edges]);

  // Initial Data Sync: If state has elements but local nodes/edges are empty (on first render), set them.
  useEffect(() => {
    if (state.editor.elements.length > 0 && nodes.length === 0) {
      setNodes(state.editor.elements as EditorNodeType[]);
    }
    if (state.editor.edges.length > 0 && edges.length === 0) {
      setEdges(state.editor.edges);
    }
  }, [state.editor.elements, state.editor.edges]);

  const nodeTypes = useMemo(
    () => ({
      Action: EditorCanvasCardSingle,
      Trigger: EditorCanvasCardSingle,
      Email: EditorCanvasCardSingle,
      Condition: EditorCanvasCardSingle,
      AI: EditorCanvasCardSingle,
      Slack: EditorCanvasCardSingle,
      "Google Drive": EditorCanvasCardSingle,
      Notion: EditorCanvasCardSingle,
      Discord: EditorCanvasCardSingle,
      "Custom Webhook": EditorCanvasCardSingle,
      "Google Calendar": EditorCanvasCardSingle,
      Wait: EditorCanvasCardSingle,
      "HTTP Request": EditorCanvasCardSingle,
      Webhook: EditorCanvasCardSingle,
      Delay: EditorCanvasCardSingle,
      "Data Transform": EditorCanvasCardSingle,
      "Key-Value Storage": EditorCanvasCardSingle,
      "Toast Message": EditorCanvasCardSingle,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      "plus-edge": PlusEdge,
    }),
    [],
  );

  // Keyboard shortcuts: Undo (Cmd+Z), Redo (Cmd+Shift+Z), Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd+Z (without Shift)
      if (cmdKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if (cmdKey && ((e.key === "z" && e.shiftKey) || e.key === "y")) {
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }

      // Delete selected node: Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedNodeId = state.editor.selectedNode?.id;
        if (selectedNodeId && selectedNodeId !== "") {
          e.preventDefault();
          dispatch({
            type: "DELETE_NODE",
            payload: { nodeId: selectedNodeId },
          });
          toast.success("Node deleted");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.editor.selectedNode?.id]);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full items-center justify-center">
          <div style={{ width: "100%", height: "100%" }} className="relative">
            <ReactFlow
              className="w-full h-full"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              nodes={state.editor.elements}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              fitView
              onPaneClick={handleClickCanvas}
              onNodesDelete={onNodesDelete}
              onReconnect={onReconnect}
              onReconnectStart={onReconnectStart}
              onReconnectEnd={onReconnectEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{ type: "plus-edge" }}
            >
              <Controls position="top-left" />
              <MiniMap
                position="bottom-left"
                className="!bg-background"
                zoomable
                pannable
              />
              <Background
                //@ts-ignore
                variant="dots"
                gap={12}
                size={1}
              />
            </ReactFlow>

            {/* Top-right Add Node button - hidden when sidebar is open */}
            {!state.editor.isSidebarOpen &&
              state.editor.elements.length > 0 && (
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    onClick={() => {
                      // Get the last node's position to place the new one below it
                      const lastNode =
                        state.editor.elements[state.editor.elements.length - 1];
                      const newY = lastNode ? lastNode.position.y + 200 : 200;
                      const newX = lastNode ? lastNode.position.x : 250;
                      dispatch({
                        type: "OPEN_ADD_MODAL",
                        payload: {
                          position: { x: newX, y: newY },
                          sourceNodeId: lastNode?.id,
                        },
                      });
                    }}
                    className="gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Node
                  </Button>
                </div>
              )}

            {state.editor.elements.length === 0 &&
              !state.editor.isAddModalOpen && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[40]">
                  <div className="bg-background/80 backdrop-blur-sm p-12 rounded-3xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center gap-6 text-center pointer-events-auto shadow-2xl animate-in zoom-in-95 relative z-[41]">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                      <Plus size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold">
                        Start your automation
                      </h3>
                      <p className="text-muted-foreground max-w-[300px]">
                        Click the button below to add your first trigger and
                        begin building your flow.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => {
                        dispatch({
                          type: "OPEN_ADD_MODAL",
                          payload: { position: { x: 250, y: 200 } },
                        });
                      }}
                      className="rounded-full px-8 h-14 text-lg font-bold shadow-xl hover:shadow-primary/20 transition-all font-mono"
                    >
                      ADD TRIGGER
                    </Button>
                  </div>
                </div>
              )}
            <AddStepModal />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      {state.editor.isSidebarOpen && (
        <ResizablePanel defaultSize={30} className="relative sm:block">
          <FlowInstance edges={edges} nodes={nodes}>
            <EditorCanvasSidebar />
          </FlowInstance>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
};

export default EditorCanvas;
