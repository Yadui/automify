"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor } from "@/providers/editor-provider";
import React, { useState } from "react";
import { toast } from "sonner";
import { GitBranch, Plus, Trash2, X } from "lucide-react";
import SmartInput from "../smart-input";
import { v4 as uuidv4 } from "uuid";

interface Condition {
  id: string;
  leftOperand: string;
  operator: string;
  rightOperand: string;
}

interface ConditionGroup {
  id: string;
  logic: "AND" | "OR";
  conditions: Condition[];
}

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "exists", label: "Exists" },
  { value: "is_empty", label: "Is Empty" },
];

const UNARY_OPERATORS = ["exists", "is_empty"];

const createEmptyCondition = (): Condition => ({
  id: uuidv4(),
  leftOperand: "",
  operator: "equals",
  rightOperand: "",
});

const ConditionWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  // Initialize from saved metadata or default
  const [rootLogic, setRootLogic] = useState<"AND" | "OR">(
    metadata.rootLogic || "AND"
  );
  const [conditions, setConditions] = useState<Condition[]>(
    metadata.conditions || [createEmptyCondition()]
  );
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const addCondition = () => {
    if (conditions.length >= 10) {
      toast.error("Maximum 10 conditions allowed");
      return;
    }
    setConditions([...conditions, createEmptyCondition()]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length === 1) {
      toast.error("At least one condition is required");
      return;
    }
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (
    id: string,
    field: keyof Condition,
    value: string
  ) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const evaluateCondition = (c: Condition): boolean => {
    const left = c.leftOperand;
    const right = c.rightOperand;

    switch (c.operator) {
      case "equals":
        return left === right;
      case "not_equals":
        return left !== right;
      case "contains":
        return String(left).includes(right);
      case "not_contains":
        return !String(left).includes(right);
      case "starts_with":
        return String(left).startsWith(right);
      case "ends_with":
        return String(left).endsWith(right);
      case "greater_than":
        return Number(left) > Number(right);
      case "less_than":
        return Number(left) < Number(right);
      case "exists":
        return left !== "" && left !== null && left !== undefined;
      case "is_empty":
        return left === "" || left === null || left === undefined;
      default:
        return false;
    }
  };

  const handleTest = () => {
    try {
      const results = conditions.map(evaluateCondition);
      const finalResult =
        rootLogic === "AND" ? results.every((r) => r) : results.some((r) => r);

      setTestResult(finalResult);
      if (finalResult) toast.success("Condition evaluated to TRUE");
      else toast.info("Condition evaluated to FALSE");
    } catch (error: any) {
      toast.error("Evaluation failed: " + error.message);
    }
  };

  const generateLabel = (): string => {
    const parts = conditions.map((c) => {
      if (UNARY_OPERATORS.includes(c.operator)) {
        return `${c.leftOperand} ${c.operator.replace("_", " ")}`;
      }
      return `${c.leftOperand} ${c.operator.replace("_", " ")} ${
        c.rightOperand
      }`;
    });
    return parts.join(` ${rootLogic} `);
  };

  const generatePreview = (): string => {
    const parts = conditions.map((c, i) => {
      const op =
        OPERATORS.find((o) => o.value === c.operator)?.label || c.operator;
      if (UNARY_OPERATORS.includes(c.operator)) {
        return `"${c.leftOperand || "..."}" ${op}`;
      }
      return `"${c.leftOperand || "..."}" ${op} "${c.rightOperand || "..."}"`;
    });

    if (parts.length === 1) return `IF ${parts[0]}`;
    return `IF (${parts.join(`) ${rootLogic} (`)})`;
  };

  const handleSave = () => {
    // Validate
    const hasEmpty = conditions.some(
      (c) =>
        !c.leftOperand ||
        (!UNARY_OPERATORS.includes(c.operator) && !c.rightOperand)
    );
    if (hasEmpty) {
      toast.error("Please fill in all condition fields");
      return;
    }

    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                configStatus: "active",
                metadata: {
                  ...node.data.metadata,
                  rootLogic,
                  conditions,
                  eventLabel: generateLabel(),
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Condition configured");
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Condition Builder</CardTitle>
          <CardDescription>
            Define conditions to control workflow branching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logic Selector */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Label className="text-sm">Match</Label>
            <Select
              value={rootLogic}
              onValueChange={(v) => setRootLogic(v as "AND" | "OR")}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">ALL</SelectItem>
                <SelectItem value="OR">ANY</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              of the following conditions
            </span>
          </div>

          {/* Conditions List */}
          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div
                key={condition.id}
                className="relative p-3 border rounded-lg bg-background space-y-3"
              >
                {/* Remove button */}
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20"
                    onClick={() => removeCondition(condition.id)}
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>
                )}

                {/* Left Operand */}
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <SmartInput
                    value={condition.leftOperand}
                    onChange={(v) =>
                      updateCondition(condition.id, "leftOperand", v)
                    }
                    placeholder="Enter value or {{variable}}"
                  />
                </div>

                {/* Operator */}
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Operator
                  </Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(v) =>
                      updateCondition(condition.id, "operator", v)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Right Operand (if not unary) */}
                {!UNARY_OPERATORS.includes(condition.operator) && (
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Compare To
                    </Label>
                    <SmartInput
                      value={condition.rightOperand}
                      onChange={(v) =>
                        updateCondition(condition.id, "rightOperand", v)
                      }
                      placeholder="Comparison value"
                    />
                  </div>
                )}

                {/* Logic connector label */}
                {index < conditions.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded z-10">
                    {rootLogic}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={addCondition}
            disabled={conditions.length >= 10}
          >
            <Plus className="h-4 w-4" />
            Add Condition
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <div className="p-3 bg-muted/30 rounded-lg border text-sm">
        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
        <p className="font-mono text-xs">{generatePreview()}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleTest} variant="secondary" className="flex-1">
          <GitBranch className="mr-2 h-4 w-4" />
          Test
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save
        </Button>
      </div>

      {/* Test Result */}
      {testResult !== null && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
            testResult
              ? "bg-green-500/10 text-green-600 border border-green-500/20"
              : "bg-red-500/10 text-red-600 border border-red-500/20"
          }`}
        >
          {testResult ? "✓ TRUE — Flow continues" : "✗ FALSE — Flow stops"}
        </div>
      )}
    </div>
  );
};

export default ConditionWizard;
