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
import { Database, Play } from "lucide-react";
import SmartInput from "../smart-input";

// Mock storage for frontend testing
const mockStorage: Record<string, string> = {
  sample_key: "sample_value",
  counter: "42",
};

const KVStorageWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [action, setAction] = useState(metadata.action || "get");
  const [key, setKey] = useState(metadata.key || "");
  const [value, setValue] = useState(metadata.value || "");
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = () => {
    let output;
    try {
      switch (action) {
        case "get":
          if (mockStorage.hasOwnProperty(key)) {
            output = { found: true, value: mockStorage[key] };
          } else {
            output = { found: false, value: null };
          }
          break;
        case "set":
          mockStorage[key] = value;
          output = { success: true, key, value };
          break;
        case "increment":
          const current = parseInt(mockStorage[key] || "0");
          if (isNaN(current)) throw new Error("Current value is not a number");
          const incrementBy = parseInt(value || "1");
          const newVal = current + incrementBy;
          mockStorage[key] = newVal.toString();
          output = { success: true, key, value: newVal };
          break;
        default:
          throw new Error("Unknown action");
      }

      setTestResult(output);
      toast.success(`Action '${action}' executed successfully (Mock)`);
    } catch (error: any) {
      toast.error("Operation failed: " + error.message);
      setTestResult({ error: error.message });
    }
  };

  const handleSave = () => {
    let label = "";
    if (action === "get") label = `Get '${key}'`;
    else if (action === "set") label = `Set '${key}'`;
    else label = `Increment '${key}'`;

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
                  action,
                  key,
                  value,
                  eventLabel: label,
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Storage action configured");
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Key-Value Storage</CardTitle>
          <CardDescription>Persist data across workflow runs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="get">Get</SelectItem>
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="increment">Increment Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Key</Label>
            <SmartInput
              value={key}
              onChange={setKey}
              placeholder="user_id_123"
            />
          </div>

          {action !== "get" && (
            <div className="grid gap-2">
              <Label>
                {action === "increment" ? "Increment By (Default: 1)" : "Value"}
              </Label>
              <SmartInput
                value={value}
                onChange={setValue}
                placeholder={action === "increment" ? "1" : "some value"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleTest}
          variant="secondary"
          className="flex-1"
          disabled={!key}
        >
          <Database className="mr-2 h-4 w-4" />
          Test Action
        </Button>
        <Button onClick={handleSave} disabled={!testResult} className="flex-1">
          Save Configuration
        </Button>
      </div>

      {testResult && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Mock Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KVStorageWizard;
