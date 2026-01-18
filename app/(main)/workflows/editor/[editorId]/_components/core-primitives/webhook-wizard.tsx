"use client";

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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEditor } from "@/providers/editor-provider";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, RefreshCw, Shield, Webhook, Zap } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Managed webhook providers (future-ready)
const MANAGED_PROVIDERS = [
  {
    id: "stripe",
    name: "Stripe",
    events: ["charge.succeeded", "invoice.paid", "customer.created"],
  },
  { id: "github", name: "GitHub", events: ["push", "pull_request", "issues"] },
  {
    id: "shopify",
    name: "Shopify",
    events: ["orders/create", "products/update"],
  },
];

const WebhookWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  // Mode: custom (default) or managed (future)
  const [mode, setMode] = useState<"custom" | "managed">(
    metadata.mode || "custom"
  );

  // Custom mode fields
  const [webhookId, setWebhookId] = useState(metadata.webhookId || "");
  const [secret, setSecret] = useState(metadata.secret || "");
  const [allowPost, setAllowPost] = useState(metadata.allowPost !== false);
  const [allowGet, setAllowGet] = useState(metadata.allowGet || false);
  const [requireSecret, setRequireSecret] = useState(
    metadata.requireSecret || false
  );

  // Managed mode fields (future)
  const [provider, setProvider] = useState(metadata.provider || "");
  const [event, setEvent] = useState(metadata.event || "");

  const [testPayload, setTestPayload] = useState<any>(null);
  const [isWaiting, setIsWaiting] = useState(false);

  // Generate IDs on mount if not present
  useEffect(() => {
    if (!webhookId) {
      setWebhookId(`wh_${uuidv4().replace(/-/g, "").slice(0, 16)}`);
    }
    if (!secret) {
      setSecret(`sk_${uuidv4().replace(/-/g, "")}`);
    }
  }, []);

  const webhookUrl = `https://api.automify.app/hooks/${webhookId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copied to clipboard");
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  const handleRegenerateUrl = () => {
    const newId = `wh_${uuidv4().replace(/-/g, "").slice(0, 16)}`;
    setWebhookId(newId);
    toast.success("Webhook URL regenerated");
  };

  const handleRegenerateSecret = () => {
    const newSecret = `sk_${uuidv4().replace(/-/g, "")}`;
    setSecret(newSecret);
    toast.success("Secret regenerated");
  };

  const handleSimulateReceive = () => {
    setIsWaiting(true);
    setTimeout(() => {
      setTestPayload({
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(requireSecret ? { "x-webhook-secret": "[REDACTED]" } : {}),
        },
        query: {},
        body: {
          event: mode === "managed" ? event : "custom.event",
          data: {
            id: "obj_" + uuidv4().slice(0, 8),
            email: "test@example.com",
            name: "John Doe",
          },
          timestamp: new Date().toISOString(),
        },
        receivedAt: new Date().toISOString(),
      });
      setIsWaiting(false);
      toast.success("Webhook payload received");
    }, 1500);
  };

  const handleSave = () => {
    if (mode === "custom" && !allowPost && !allowGet) {
      toast.error("At least one HTTP method must be allowed");
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
                  // Config version
                  version: "2.0",
                  mode,
                  // Custom mode
                  webhookId,
                  webhookUrl,
                  allowPost,
                  allowGet,
                  requireSecret,
                  // Secret is stored but NEVER exported
                  secret: requireSecret ? secret : undefined,
                  // Managed mode
                  provider: mode === "managed" ? provider : undefined,
                  event: mode === "managed" ? event : undefined,
                  // Sample for mapping
                  samplePayload: testPayload,
                  // Label
                  eventLabel:
                    mode === "managed"
                      ? `${provider}:${event}`
                      : "Receive Webhook",
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Webhook Trigger configured");
  };

  const selectedProvider = MANAGED_PROVIDERS.find((p) => p.id === provider);

  return (
    <div className="space-y-4 p-4">
      {/* Trigger Badge */}
      <div className="flex items-center gap-2 text-sm text-primary">
        <Zap className="h-4 w-4" />
        <span className="font-medium">This node starts the workflow</span>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Trigger
          </CardTitle>
          <CardDescription>
            Receive HTTP requests to trigger this workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="grid gap-2">
            <Label>Mode</Label>
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as "custom" | "managed")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    Custom
                    <Badge variant="secondary" className="text-[10px]">
                      Default
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="managed" disabled>
                  <div className="flex items-center gap-2">
                    App-Managed
                    <Badge variant="outline" className="text-[10px]">
                      Coming Soon
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Mode Fields */}
          {mode === "custom" && (
            <>
              {/* Webhook URL */}
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRegenerateUrl}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* HTTP Methods */}
              <div className="grid gap-3">
                <Label>Allowed Methods</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="allow-post"
                      checked={allowPost}
                      onCheckedChange={setAllowPost}
                    />
                    <Label htmlFor="allow-post" className="text-sm font-normal">
                      POST
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="allow-get"
                      checked={allowGet}
                      onCheckedChange={setAllowGet}
                    />
                    <Label htmlFor="allow-get" className="text-sm font-normal">
                      GET
                    </Label>
                  </div>
                </div>
              </div>

              {/* Secret Token */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Require Secret Token
                  </Label>
                  <Switch
                    checked={requireSecret}
                    onCheckedChange={setRequireSecret}
                  />
                </div>
                {requireSecret && (
                  <div className="flex gap-2">
                    <Input
                      value={secret}
                      readOnly
                      className="font-mono text-xs"
                      type="password"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRegenerateSecret}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {requireSecret && (
                  <p className="text-xs text-muted-foreground">
                    Include as{" "}
                    <code className="bg-muted px-1 rounded">
                      X-Webhook-Secret
                    </code>{" "}
                    header or{" "}
                    <code className="bg-muted px-1 rounded">?token=</code> query
                    param
                  </p>
                )}
              </div>
            </>
          )}

          {/* Managed Mode Fields (Future) */}
          {mode === "managed" && (
            <>
              <div className="grid gap-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGED_PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <div className="grid gap-2">
                  <Label>Event</Label>
                  <Select value={event} onValueChange={setEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider.events.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSimulateReceive}
          disabled={isWaiting}
          variant="secondary"
          className="flex-1"
        >
          {isWaiting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isWaiting ? "Waiting..." : "Simulate Event"}
        </Button>
        <Button onClick={handleSave} disabled={!testPayload} className="flex-1">
          Save
        </Button>
      </div>

      {/* Test Payload */}
      {testPayload && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Captured Payload</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
              {JSON.stringify(testPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Output Info */}
      <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Output:</strong> method, headers, query, body, receivedAt
        </p>
        <p className="text-[10px]">
          Output shape is identical regardless of mode.
        </p>
      </div>
    </div>
  );
};

export default WebhookWizard;
