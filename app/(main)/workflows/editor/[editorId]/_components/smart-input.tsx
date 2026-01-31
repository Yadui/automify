"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useEditor } from "@/providers/editor-provider";
import {
  useNodeId,
  getIncomers,
  type Node as FlowNode,
  type Edge,
} from "reactflow";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { NODE_OUTPUTS } from "@/lib/node-outputs";
import { cn } from "@/lib/utils";
import { Variable, Image as ImageIcon } from "lucide-react";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "input" | "textarea";
}

const getAncestors = (
  nodeId: string,
  nodes: FlowNode[],
  edges: Edge[],
  visited = new Set<string>(),
): FlowNode[] => {
  // Prevent infinite recursion in cyclic graphs
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);

  const currentNode = nodes.find((n) => n.id === nodeId);
  if (!currentNode) return [];

  const incomers = getIncomers(currentNode, nodes, edges);
  let ancestors: FlowNode[] = [...incomers];

  incomers.forEach((incomer) => {
    ancestors = [
      ...ancestors,
      ...getAncestors(incomer.id, nodes, edges, visited),
    ];
  });

  // Remove duplicates
  return Array.from(new Set(ancestors.map((n) => n.id)))
    .map((id) => ancestors.find((n) => n.id === id)!)
    .filter((n) => n.id !== nodeId); // Ensure current node is not included
};

const SmartInput = ({
  value,
  onChange,
  placeholder,
  className,
  type = "input",
  enableRichToolbar = false,
}: SmartInputProps & { enableRichToolbar?: boolean }) => {
  const { state } = useEditor();
  const nodeId = state.editor.selectedNode?.id;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Ref for the content editable element
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  // We need to keep a mapping of NodeID -> NodeTitle for rendering chips
  // This memoized map makes lookups fast
  const nodeMap = useMemo(() => {
    const map = new Map<string, string>();
    state.editor.elements.forEach((el) => map.set(el.id, el.data.title));
    return map;
  }, [state.editor.elements]);

  const [filteredOutputs, setFilteredOutputs] = useState<
    { node: FlowNode; outputs: (typeof NODE_OUTPUTS)[string] }[]
  >([]);

  useEffect(() => {
    if (!nodeId) return;
    const nodes = state.editor.elements;
    const edges = state.editor.edges;
    const ancestors = getAncestors(nodeId, nodes, edges);
    const options = ancestors
      .map((node) => ({
        node,
        outputs: NODE_OUTPUTS[node.data.type] || [],
      }))
      .filter((item) => item.outputs.length > 0);
    setFilteredOutputs(options);
  }, [nodeId, state.editor.elements, state.editor.edges]);

  // SERIALIZER: HTML -> Data String ({{nodeId.var}})
  const getInternalValue = () => {
    if (!contentEditableRef.current) return "";
    let text = "";
    contentEditableRef.current.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.hasAttribute("data-variable")) {
          text += el.getAttribute("data-variable");
        } else {
          text += el.innerText;
        }
      }
    });
    return text;
  };

  // DESERIALIZER: Data String -> HTML
  // Replaces {{nodeId.var}} with <span class="chip">...</span>
  const renderHTML = (rawValue: string) => {
    if (!rawValue) return "";
    // Regex to match {{nodeId.variable}}
    // We strictly match the pattern we insert: {{uuid.word}}

    return rawValue.replace(/\{\{([^.]+)\.([^}]+)\}\}/g, (match, nId, vKey) => {
      const nTitle = nodeMap.get(nId) || "Unknown Node";
      return `<span contenteditable="false" data-variable="${match}" class="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 cursor-default select-none border border-primary/20 align-middle whitespace-nowrap gap-1"><span class="opacity-70">${nTitle}</span><span class="opacity-30">·</span><span>${vKey}</span></span>`;
    });
  };

  // Sync external value to HTML (only if different, to avoid cursor jumps)
  // This is tricky with ContentEditable.
  // We only set innerHTML if the serialized version of current HTML != new external value.
  useEffect(() => {
    if (contentEditableRef.current) {
      const currentInternal = getInternalValue();
      if (currentInternal !== value) {
        contentEditableRef.current.innerHTML = renderHTML(value);
      }
    }
  }, [value, nodeMap]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Only save if within our editor
      if (contentEditableRef.current?.contains(range.commonAncestorContainer)) {
        savedRange.current = range.cloneRange();
      }
    }
  };

  const handleInput = () => {
    saveSelection();
    const newVal = getInternalValue();
    onChange(newVal);
    // ... rest of handleInput
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const textBefore = node.textContent?.slice(0, range.startOffset) || "";
        if (textBefore.endsWith("/")) {
          setOpen(true);
          setSearch("");
        }
      }
    }
  };

  const insertVariable = (
    nodeId: string,
    nodeTitle: string,
    varLabel: string,
    varValue: string,
  ) => {
    // 1. Create Chip Element
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.setAttribute("data-variable", `{{${nodeId}.${varValue}}}`);
    chip.className =
      "inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 cursor-default select-none border border-primary/20 align-middle whitespace-nowrap gap-1";
    chip.innerHTML = `<span class="opacity-70">${nodeTitle}</span><span class="opacity-30">·</span><span>${varLabel}</span>`;

    // 2. Insert at Selection
    // Restore selection from savedRange if available
    const selection = window.getSelection();
    if (savedRange.current) {
      selection?.removeAllRanges();
      selection?.addRange(savedRange.current);
    }

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Verify we are actually in the editor
      if (
        !contentEditableRef.current?.contains(range.commonAncestorContainer)
      ) {
        // Fallback: append if range is invalid/external
        contentEditableRef.current?.appendChild(chip);
        handleInput();
        setOpen(false);
        return;
      }

      // Check if we just typed "/", if so delete it
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = range.startContainer;
        const text = textNode.textContent || "";
        // If we opened via "/", the slash might be just before the cursor
        if (text.endsWith("/") && range.endOffset === text.length) {
          textNode.textContent = text.slice(0, -1);
        } else if (text.slice(0, range.endOffset).endsWith("/")) {
          // Slash is at cursor position, e.g. "foo/|"
          const offset = range.endOffset;
          textNode.textContent = text.slice(0, offset - 1) + text.slice(offset);
        }
      }

      range.deleteContents();
      range.insertNode(chip);

      // Move cursor after chip
      range.setStartAfter(chip);
      range.setEndAfter(chip);

      // Update saved range to new position
      savedRange.current = range.cloneRange();

      selection.removeAllRanges();
      selection.addRange(range);

      // 3. Trigger Change
      handleInput();
    } else {
      // No selection? Append.
      if (contentEditableRef.current) {
        contentEditableRef.current.appendChild(chip);
        handleInput();
      }
    }

    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Escape to close logic if we had it
    if (e.key === "Enter" && !e.shiftKey && type === "input") {
      e.preventDefault(); // Single line input behavior
    }
    if (e.key === "/") {
      setOpen(true);
      setSearch("");
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Sync formatting change
    handleInput();
    contentEditableRef.current?.focus();
  };

  return (
    <div className="relative w-full flex flex-col gap-1" ref={containerRef}>
      {enableRichToolbar && (
        <div className="flex items-center gap-1 p-1 border rounded-md bg-muted/20 mb-1">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("bold");
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <span className="font-bold text-xs">B</span>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("italic");
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <span className="italic text-xs">I</span>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("underline");
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <span className="underline text-xs">U</span>
          </button>
          <div className="w-[1px] h-4 bg-border mx-1" />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("insertUnorderedList");
            }}
            className="p-1 hover:bg-muted rounded"
            title="Bullet List"
          >
            <span className="text-xs">List</span>
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("insertOrderedList");
            }}
            className="p-1 hover:bg-muted rounded"
            title="Numbered List"
          >
            <span className="text-xs">1.</span>
          </button>
          <div className="w-[1px] h-4 bg-border mx-1" />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              // Trigger file upload
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    applyFormat("insertImage", result);
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-start gap-2 w-full">
        <div className="relative w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
              <div
                ref={contentEditableRef}
                contentEditable
                suppressContentEditableWarning={true}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] whitespace-pre-wrap break-words cursor-text",
                  className,
                  type === "textarea" ? "min-h-[80px]" : "overflow-hidden",
                )}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onClick={saveSelection}
              />
            </PopoverAnchor>
            <PopoverContent
              className="p-0 w-[300px]"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search variables..."
                  autoFocus
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No variables found.</CommandEmpty>
                  {filteredOutputs
                    .filter(({ node, outputs }) => {
                      if (!search) return true;
                      const term = search.toLowerCase();
                      return (
                        node.data.title.toLowerCase().includes(term) ||
                        outputs.some((o) =>
                          o.label.toLowerCase().includes(term),
                        )
                      );
                    })
                    .map(({ node, outputs }) => (
                      <CommandGroup key={node.id} heading={node.data.title}>
                        {outputs
                          .filter(
                            (output) =>
                              !search ||
                              output.label
                                .toLowerCase()
                                .includes(search.toLowerCase()) ||
                              node.data.title
                                .toLowerCase()
                                .includes(search.toLowerCase()),
                          )
                          .map((output) => (
                            <CommandItem
                              key={`${node.id}-${output.value}`}
                              value={`${node.data.title} ${output.label}`}
                              onSelect={() => {
                                insertVariable(
                                  node.id,
                                  node.data.title,
                                  output.label,
                                  output.value,
                                );
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                insertVariable(
                                  node.id,
                                  node.data.title,
                                  output.label,
                                  output.value,
                                );
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Variable className="h-3 w-3 text-muted-foreground" />
                              <span>{output.label}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {output.type}
                              </span>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Helper Button for inserting variable */}
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 mt-1.5 h-7 w-7 rounded-sm hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors border border-input bg-transparent"
          title="Insert Variable"
        >
          <Variable className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SmartInput;
