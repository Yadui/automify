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
import { Database, Loader2, Trash2 } from "lucide-react";
import SmartInput from "../smart-input";
import { parseVariables } from "@/lib/utils";

const KVStorageWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = (selectedNode.data.metadata || {}) as Record<string, any>;

  const [action, setAction] = useState(metadata.action || "get");
  const [key, setKey] = useState(metadata.key || "");
  const [value, setValue] = useState(metadata.value || "");
  const [testResult, setTestResult] = useState<any>(
    () => metadata.sampleData ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    if (!key) { toast.error("Key is required"); return; }
    setIsLoading(true);
    setTestResult(null);

    // Resolve any {{node.var}} references before sending
    const resolvedKey = parseVariables(key, state.editor.elements);
    const resolvedValue = parseVariables(value, state.editor.elements);

    try {
      let result: any;

      if (action === "get") {
        const res = await fetch(`/api/kv?key=${encodeURIComponent(resolvedKey)}`);
        result = await res.json();
      } else if (action === "delete") {
        const res = await fetch(`/api/kv?key=${encodeURIComponent(resolvedKey)}`, {
          method: "DELETE",
        });
        result = await res.json();
      } else {
        // set or increment
        const res = await fetch("/api/kv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: resolvedKey,
            value: resolvedValue,
            action,
            incrementBy: action === "increment" ? Number(resolvedValue) || 1 : undefined,
          }),
        });
        result = await res.json();
      }

      if (result.error) throw new Error(result.error);

      setTestResult(result);
      toast.success(`'${action}' on '${resolvedKey}' succeeded`);
    } catch (error: any) {
      toast.error("Operation failed: " + error.message);
      setTestResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!key) { toast.error("Key is required"); return; }

    let label = "";
    if (action === "get") label = `Get '${key}'`;
    else if (action === "set") label = `Set '${key}'`;
    else if (action === "increment") label = `Increment '${key}'`;
    else label = `Delete '${key}'`;

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
                  sampleData: testResult ?? node.data.metadata?.sampleData,
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
            <Select value={action} onValueChange={(v) => { setAction(v); setTestResult(null); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="get">Get</SelectItem>
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="increment">Increment Number</SelectItem>
                <SelectItem value="delete">
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-3 w-3" /> Delete
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Key</Label>
            <SmartInput
              value={key}
              onChange={setKey}
              placeholder="my_key"
            />
          </div>

          {(action === "set" || action === "increment") && (
            <div className="grid gap-2">
              <Label>
                {action === "increment" ? "Increment By (default: 1)" : "Value"}
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
          disabled={!key || isLoading}
        >
          {isLoading
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <Database className="mr-2 h-4 w-4" />}
          Test Action
        </Button>
        <Button onClick={handleSave} disabled={!key} className="flex-1">
          Save Configuration
        </Button>
      </div>

      {testResult && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className={`text-sm ${testResult.error ? "text-red-600" : "text-green-600"}`}>
              {testResult.error ? `✗ Error` : `✓ Result`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground">
        <p><strong>Output:</strong> value, found, success, key</p>
        <p className="mt-1">Keys are scoped per user — no other user can access your keys.</p>
      </div>
    </div>
  );
};

export default KVStorageWizard;
