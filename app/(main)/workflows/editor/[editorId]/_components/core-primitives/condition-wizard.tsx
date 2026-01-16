import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { GitBranch } from "lucide-react";
import SmartInput from "../smart-input";

const ConditionWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [leftOperand, setLeftOperand] = useState(metadata.leftOperand || "");
  const [operator, setOperator] = useState(metadata.operator || "equals");
  const [rightOperand, setRightOperand] = useState(metadata.rightOperand || "");
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleTest = () => {
    try {
      let result = false;

      switch (operator) {
        case "equals":
          result = leftOperand === rightOperand;
          break;
        case "not_equals":
          result = leftOperand !== rightOperand;
          break;
        case "contains":
          result = String(leftOperand).includes(rightOperand);
          break;
        case "starts_with":
          result = String(leftOperand).startsWith(rightOperand);
          break;
        case "ends_with":
          result = String(leftOperand).endsWith(rightOperand);
          break;
        case "greater_than":
          result = Number(leftOperand) > Number(rightOperand);
          break;
        case "less_than":
          result = Number(leftOperand) < Number(rightOperand);
          break;
        case "exists":
          result =
            leftOperand !== "" &&
            leftOperand !== null &&
            leftOperand !== undefined;
          break;
        case "is_empty":
          result =
            leftOperand === "" ||
            leftOperand === null ||
            leftOperand === undefined;
          break;
        default:
          throw new Error("Unknown operator");
      }

      setTestResult(result);
      if (result) toast.success("Condition evaluated to TRUE");
      else toast.info("Condition evaluated to FALSE");
    } catch (error: any) {
      toast.error("Evaluation failed: " + error.message);
    }
  };

  const handleSave = () => {
    let label = "";
    if (operator === "exists") label = `'${leftOperand}' exists`;
    else if (operator === "is_empty") label = `'${leftOperand}' is empty`;
    else label = `'${leftOperand}' ${operator} '${rightOperand}'`;

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
                  leftOperand,
                  operator,
                  rightOperand,
                  eventLabel: label,
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
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Condition</CardTitle>
          <CardDescription>
            Stop the flow if the condition is not met (Linear).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Value A (Left Operand)</Label>
            <SmartInput
              value={leftOperand}
              onChange={setLeftOperand}
              placeholder="Input value or mapped field"
            />
          </div>

          <div className="grid gap-2">
            <Label>Operator</Label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="starts_with">Starts With</SelectItem>
                <SelectItem value="ends_with">Ends With</SelectItem>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
                <SelectItem value="exists">Exists</SelectItem>
                <SelectItem value="is_empty">Is Empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {["exists", "is_empty"].indexOf(operator) === -1 && (
            <div className="grid gap-2">
              <Label>Value B (Right Operand)</Label>
              <SmartInput
                value={rightOperand}
                onChange={setRightOperand}
                placeholder="Comparison value"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleTest} variant="secondary" className="flex-1">
          <GitBranch className="mr-2 h-4 w-4" />
          Test Condition
        </Button>
        <Button
          onClick={handleSave}
          disabled={testResult === null}
          className="flex-1"
        >
          Save Configuration
        </Button>
      </div>

      {testResult !== null && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 font-medium ${
            testResult
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {testResult ? "True: Flow continues" : "False: Flow stops"}
        </div>
      )}
    </div>
  );
};

export default ConditionWizard;
