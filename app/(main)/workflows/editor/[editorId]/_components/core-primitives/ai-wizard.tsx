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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEditor } from "@/providers/editor-provider";
import React, { useState } from "react";
import { toast } from "sonner";
import { Brain, Loader2, Sparkles } from "lucide-react";
import SmartInput from "../smart-input";
import { parseVariables } from "@/lib/utils";

type AIOperation = "summarize" | "extract" | "generate" | "custom";
type AIProvider = "groq" | "openai";

const OPERATIONS: { value: AIOperation; label: string; description: string }[] = [
  { value: "summarize", label: "Summarize", description: "Condense long text into a short summary" },
  { value: "extract",   label: "Extract",   description: "Pull specific fields from text as JSON" },
  { value: "generate",  label: "Generate",  description: "Generate text from a prompt" },
  { value: "custom",    label: "Custom",    description: "Write your own system + user prompts" },
];

const AIWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = (selectedNode.data.metadata || {}) as Record<string, any>;

  const [operation, setOperation]               = useState<AIOperation>(metadata.operation || "summarize");
  const [provider, setProvider]                 = useState<AIProvider>(metadata.provider || "groq");
  const [model, setModel]                       = useState<"fast" | "smart">(metadata.model || "fast");
  const [input, setInput]                       = useState<string>(metadata.input || "");
  const [extractFields, setExtractFields]       = useState<string>(metadata.extractFields || "");
  const [customSystemPrompt, setCustomSystem]   = useState<string>(metadata.customSystemPrompt || "");
  const [customUserPrompt, setCustomUser]       = useState<string>(metadata.customUserPrompt || "");
  const [useOwnKey, setUseOwnKey]               = useState<boolean>(Boolean(metadata.apiKey));
  const [apiKey, setApiKey]                     = useState<string>(metadata.apiKey || "");
  const [testResult, setTestResult]             = useState<any>(() => metadata.sampleData ?? null);
  const [isLoading, setIsLoading]               = useState(false);

  const handleTest = async () => {
    const resolvedInput = parseVariables(input, state.editor.elements);
    if (!resolvedInput) { toast.error("Input is required"); return; }

    setIsLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation,
          provider,
          model,
          input: resolvedInput,
          ...(operation === "extract"  && { extractFields }),
          ...(operation === "custom"   && { customSystemPrompt, customUserPrompt }),
          ...(useOwnKey && apiKey      && { apiKey }),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "AI request failed");
      setTestResult(data);
      toast.success("AI node test passed!");
    } catch (err: any) {
      toast.error(err.message);
      setTestResult({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!input) { toast.error("Input is required"); return; }

    const opLabel = OPERATIONS.find((o) => o.value === operation)?.label ?? operation;
    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  configStatus: "active",
                  metadata: {
                    ...node.data.metadata,
                    operation,
                    provider,
                    model,
                    input,
                    extractFields,
                    customSystemPrompt,
                    customUserPrompt,
                    apiKey: useOwnKey ? apiKey : undefined,
                    eventLabel: `AI: ${opLabel}`,
                    sampleData: testResult ?? node.data.metadata?.sampleData,
                  },
                },
              }
            : node
        ),
      },
    });
    toast.success("AI node configured");
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI
          </CardTitle>
          <CardDescription>Run AI operations on text from previous steps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Operation */}
          <div className="grid gap-2">
            <Label>Operation</Label>
            <Select value={operation} onValueChange={(v) => { setOperation(v as AIOperation); setTestResult(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPERATIONS.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    <div className="flex flex-col">
                      <span>{op.label}</span>
                      <span className="text-xs text-muted-foreground">{op.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider + Model */}
          <div className="flex gap-2">
            <div className="flex-1 grid gap-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as AIProvider)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="groq">Groq (free)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 grid gap-2">
              <Label>Speed</Label>
              <Select value={model} onValueChange={(v) => setModel(v as "fast" | "smart")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="smart">Smart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Input */}
          <div className="grid gap-2">
            <Label>Input <span className="text-red-500">*</span></Label>
            <SmartInput
              type="textarea"
              value={input}
              onChange={setInput}
              placeholder="Enter text or use / to insert a variable from a previous step"
              className="min-h-[80px]"
            />
          </div>

          {/* Extract fields */}
          {operation === "extract" && (
            <div className="grid gap-2">
              <Label>Fields to extract</Label>
              <Input
                value={extractFields}
                onChange={(e) => setExtractFields(e.target.value)}
                placeholder="name, email, date, amount"
              />
              <p className="text-xs text-muted-foreground">Comma-separated field names. Returns a JSON object.</p>
            </div>
          )}

          {/* Custom prompts */}
          {operation === "custom" && (
            <>
              <div className="grid gap-2">
                <Label>System prompt</Label>
                <SmartInput
                  type="textarea"
                  value={customSystemPrompt}
                  onChange={setCustomSystem}
                  placeholder="You are a helpful assistant that..."
                  className="min-h-[60px]"
                />
              </div>
              <div className="grid gap-2">
                <Label>User prompt prefix <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <SmartInput
                  type="textarea"
                  value={customUserPrompt}
                  onChange={setCustomUser}
                  placeholder="Analyze the following and respond in JSON:"
                  className="min-h-[60px]"
                />
              </div>
            </>
          )}

          {/* Own API key toggle */}
          <div className="flex items-center justify-between pt-1">
            <Label className="text-xs text-muted-foreground">Use my own API key</Label>
            <Switch checked={useOwnKey} onCheckedChange={setUseOwnKey} />
          </div>
          {useOwnKey && (
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "groq" ? "gsk_..." : "sk-..."}
            />
          )}

          {!useOwnKey && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
              Uses the <code className="text-[10px] bg-muted px-1 rounded">
                {provider === "groq" ? "GROQ_API_KEY" : "OPENAI_API_KEY"}
              </code> environment variable. Add your key in Vercel settings.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleTest}
          variant="secondary"
          className="flex-1"
          disabled={!input || isLoading}
        >
          {isLoading
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <Sparkles className="mr-2 h-4 w-4" />}
          Test
        </Button>
        <Button onClick={handleSave} disabled={!input} className="flex-1">
          Save
        </Button>
      </div>

      {/* Result */}
      {testResult && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className={`text-sm ${testResult.error ? "text-red-600" : "text-green-600"}`}>
              {testResult.error ? `✗ ${testResult.error}` : "✓ Output"}
            </CardTitle>
          </CardHeader>
          {!testResult.error && (
            <CardContent className="pb-3">
              <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap">
                {typeof testResult.output === "object"
                  ? JSON.stringify(testResult.output, null, 2)
                  : testResult.output}
              </pre>
            </CardContent>
          )}
        </Card>
      )}

      {/* Output info */}
      <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground">
        <p><strong>Output:</strong> output, raw, operation, provider</p>
        <p className="mt-1">Reference with <code className="bg-muted px-1 rounded">{"{{nodeId.output}}"}</code></p>
      </div>
    </div>
  );
};

export default AIWizard;
