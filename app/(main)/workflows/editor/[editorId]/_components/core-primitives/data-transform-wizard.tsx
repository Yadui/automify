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
import { Textarea } from "@/components/ui/textarea";
import { useEditor } from "@/providers/editor-provider";
import React, { useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";
import SmartInput from "../smart-input";

// Helper for safe JSON parsing
const safeJsonParse = (str: string, fallback: any = {}) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

const DataTransformWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [operation, setOperation] = useState(metadata.operation || "merge");
  const [inputData, setInputData] = useState(metadata.inputData || "");
  const [param1, setParam1] = useState(metadata.param1 || ""); // e.g., keys to pick/omit, or merge source 2
  const [result, setResult] = useState<any>(null);

  const handleTest = () => {
    try {
      const input = safeJsonParse(inputData);
      let output: any;

      switch (operation) {
        case "pick":
          const pickKeys = param1.split(",").map((k: string) => k.trim());
          output = pickKeys.reduce((obj: any, key: string) => {
            if (input.hasOwnProperty(key)) obj[key] = input[key];
            return obj;
          }, {});
          break;
        case "omit":
          const omitKeys = param1.split(",").map((k: string) => k.trim());
          output = { ...input };
          omitKeys.forEach((key: string) => delete output[key]);
          break;
        case "merge":
          const mergeSource = safeJsonParse(param1);
          output = { ...input, ...mergeSource };
          break;
        case "json_stringify":
          output = JSON.stringify(input);
          break;
        case "json_parse":
          output = JSON.parse(
            typeof input === "string" ? input : JSON.stringify(input)
          );
          break;
        default:
          throw new Error("Unknown operation");
      }

      setResult(output);
      toast.success("Transformation successful");
    } catch (error: any) {
      toast.error("Transformation failed: " + error.message);
      setResult({ error: error.message });
    }
  };

  const handleSave = () => {
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
                  operation,
                  inputData,
                  param1,
                  eventLabel: `Transform: ${operation}`,
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Transform configured");
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Data Transformation</CardTitle>
          <CardDescription>Transform JSON objects or strings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Operation</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">Merge Objects</SelectItem>
                <SelectItem value="pick">Pick Keys</SelectItem>
                <SelectItem value="omit">Omit Keys</SelectItem>
                <SelectItem value="json_stringify">JSON Stringify</SelectItem>
                <SelectItem value="json_parse">JSON Parse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Input Data (JSON)</Label>
            <SmartInput
              type="textarea"
              value={inputData}
              onChange={setInputData}
              placeholder='{"foo": "bar"}'
              className="font-mono text-xs h-24"
            />
          </div>

          {["pick", "omit", "merge"].includes(operation) && (
            <div className="grid gap-2">
              <Label>
                {operation === "merge"
                  ? "Object to Merge (JSON)"
                  : "Keys (comma separated)"}
              </Label>
              {operation === "merge" ? (
                <SmartInput
                  type="textarea"
                  value={param1}
                  onChange={setParam1}
                  placeholder='{"baz": "qux"}'
                  className="font-mono text-xs h-24"
                />
              ) : (
                <SmartInput
                  value={param1}
                  onChange={setParam1}
                  placeholder="id, email, name"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleTest} variant="secondary" className="flex-1">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Test Transform
        </Button>
        <Button onClick={handleSave} disabled={!result} className="flex-1">
          Save Configuration
        </Button>
      </div>

      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataTransformWizard;
