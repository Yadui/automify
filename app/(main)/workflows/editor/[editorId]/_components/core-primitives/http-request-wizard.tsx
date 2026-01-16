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
import KeyValueInput from "./key-value-input";
import SmartInput from "../smart-input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios";

const HttpRequestWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [method, setMethod] = useState(metadata.method || "GET");
  const [url, setUrl] = useState(metadata.url || "");
  const [headers, setHeaders] = useState(metadata.headers || []);
  const [body, setBody] = useState(metadata.body || "");
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be a server action to avoid CORS issues
      // For now, we'll try a direct calls or mock it if it fails due to CORS
      // Ideally, we create an action `executeHttpRequest`

      const response = await axios({
        method,
        url,
        headers: headers.reduce(
          (acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }),
          {}
        ),
        data: body ? JSON.parse(body) : undefined,
      });

      setTestResult({
        status: response.status,
        data: response.data,
      });
      toast.success("Request successful");
    } catch (error: any) {
      console.error(error);
      setTestResult({
        error: error.message,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : undefined,
      });
      toast.error("Request failed: " + error.message);
    } finally {
      setIsLoading(false);
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
                  method,
                  url,
                  headers,
                  body,
                  eventLabel: `${method} ${url}`, // Descriptive label
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Configuration saved");
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>HTTP Request Settings</CardTitle>
          <CardDescription>
            Configure the details of your HTTP request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>URL</Label>
            <SmartInput
              value={url}
              onChange={setUrl}
              placeholder="https://api.example.com/v1/resource"
            />
          </div>

          <KeyValueInput
            items={headers}
            onChange={setHeaders}
            title="Headers"
          />

          <div className="grid gap-2">
            <Label>Body (JSON)</Label>
            <SmartInput
              type="textarea"
              value={body}
              onChange={setBody}
              placeholder='{"key": "value"}'
              className="font-mono text-xs h-32"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleTest}
          disabled={isLoading || !url}
          variant="secondary"
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Request
        </Button>
        <Button onClick={handleSave} disabled={!testResult} className="flex-1">
          Save Configuration
        </Button>
      </div>

      {testResult && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Test Output</CardTitle>
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

export default HttpRequestWizard;
