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
import { useEditor } from "@/providers/editor-provider";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const WebhookWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [webhookUrl, setWebhookUrl] = useState(metadata.webhookUrl || "");
  const [testPayload, setTestPayload] = useState<any>(null);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (!webhookUrl) {
      // Generate a unique webhook URL for this node
      // In production, this would be your API endpoint + unique ID
      const newUrl = `https://api.automify.com/hooks/${uuidv4()}`;
      setWebhookUrl(newUrl);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copied to clipboard");
  };

  const handleSimulateReceive = () => {
    setIsWaiting(true);
    // Simulate waiting for a webhook hit
    setTimeout(() => {
      setTestPayload({
        headers: {
          "content-type": "application/json",
          "user-agent": "PostmanRuntime/7.26.8",
        },
        body: {
          event: "user.created",
          data: {
            id: "usr_123",
            email: "test@example.com",
            name: "John Doe",
          },
          timestamp: new Date().toISOString(),
        },
        method: "POST",
      });
      setIsWaiting(false);
      toast.success("Webhook payload received");
    }, 2000);
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
                  webhookUrl,
                  samplePayload: testPayload,
                  eventLabel: "Receive Webhook",
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Webhook configured");
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Send a POST request to this URL to trigger the workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleSimulateReceive}
          disabled={isWaiting}
          variant="secondary"
          className="flex-1"
        >
          {isWaiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isWaiting ? "Waiting for Event..." : "Simulate Event"}
        </Button>
        <Button onClick={handleSave} disabled={!testPayload} className="flex-1">
          Save Configuration
        </Button>
      </div>

      {testPayload && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Captured Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(testPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebhookWizard;
