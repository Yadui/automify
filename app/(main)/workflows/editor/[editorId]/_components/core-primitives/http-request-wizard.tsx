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
import { useEditor } from "@/providers/editor-provider";
import React, { useState } from "react";
import KeyValueInput from "./key-value-input";
import SmartInput from "../smart-input";
import { toast } from "sonner";
import { Globe, Key, Loader2, Shield } from "lucide-react";
import axios from "axios";

interface KeyValue {
  key: string;
  value: string;
}

const HttpRequestWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [method, setMethod] = useState(metadata.method || "GET");
  const [url, setUrl] = useState(metadata.url || "");
  const [headers, setHeaders] = useState<KeyValue[]>(metadata.headers || []);
  const [queryParams, setQueryParams] = useState<KeyValue[]>(
    metadata.queryParams || [],
  );
  const [body, setBody] = useState(metadata.body || "");
  const [authType, setAuthType] = useState(metadata.authType || "none");
  const [apiKeyName, setApiKeyName] = useState(
    metadata.apiKeyName || "X-API-Key",
  );
  const [apiKeyValue, setApiKeyValue] = useState(metadata.apiKeyValue || "");
  const [bearerToken, setBearerToken] = useState(metadata.bearerToken || "");
  const [timeout, setTimeout] = useState(metadata.timeout || 30);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      // Build headers with auth
      const requestHeaders: Record<string, string> = headers.reduce(
        (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
        {},
      );

      if (authType === "api_key" && apiKeyValue) {
        requestHeaders[apiKeyName] = apiKeyValue;
      } else if (authType === "bearer" && bearerToken) {
        requestHeaders["Authorization"] = `Bearer ${bearerToken}`;
      }

      // Build query string
      const queryString = queryParams
        .filter((q) => q.key)
        .map(
          (q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`,
        )
        .join("&");
      const finalUrl = queryString ? `${url}?${queryString}` : url;

      const response = await axios({
        method,
        url: finalUrl,
        headers: requestHeaders,
        data: body ? JSON.parse(body) : undefined,
        timeout: timeout * 1000,
      });

      setTestResult({
        success: true,
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.data,
        duration: "~",
      });
      toast.success(`Request successful: ${response.status}`);
    } catch (error: any) {
      console.error(error);
      setTestResult({
        success: false,
        error: error.message,
        response: error.response
          ? {
              statusCode: error.response.status,
              body: error.response.data,
            }
          : undefined,
      });
      toast.error("Request failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!url) {
      toast.error("URL is required");
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
                  method,
                  url,
                  headers,
                  queryParams,
                  body,
                  authType,
                  apiKeyName,
                  apiKeyValue,
                  bearerToken,
                  timeout,
                  eventLabel: `${method} ${new URL(url).hostname}`,
                  sampleData: testResult
                    ? {
                        success: testResult.success,
                        statusCode: testResult.statusCode,
                        statusText: testResult.statusText,
                        headers: testResult.headers,
                        body: testResult.body,
                        data: testResult.body, // Backwards compatibility for {{node.data}}
                        duration: testResult.duration,
                      }
                    : node.data.metadata.sampleData, // Preserve existing if no new test
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
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            HTTP Request
          </CardTitle>
          <CardDescription>Call external APIs and services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method & URL */}
          <div className="flex gap-2">
            <div className="w-28">
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
            <div className="flex-1 min-w-0">
              <SmartInput
                value={url}
                onChange={setUrl}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </div>

          {/* Authentication */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </Label>
            <Select value={authType} onValueChange={setAuthType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
              </SelectContent>
            </Select>

            {authType === "api_key" && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  placeholder="Header name"
                  className="w-32"
                />
                <SmartInput
                  value={apiKeyValue}
                  onChange={setApiKeyValue}
                  placeholder="API key value"
                  className="flex-1"
                />
              </div>
            )}

            {authType === "bearer" && (
              <SmartInput
                value={bearerToken}
                onChange={setBearerToken}
                placeholder="Bearer token"
                className="mt-2"
              />
            )}
          </div>

          {/* Query Parameters */}
          <KeyValueInput
            items={queryParams}
            onChange={setQueryParams}
            title="Query Parameters"
          />

          {/* Headers */}
          <KeyValueInput
            items={headers}
            onChange={setHeaders}
            title="Headers"
          />

          {/* Body */}
          {["POST", "PUT", "PATCH"].includes(method) && (
            <div className="grid gap-2">
              <Label>Request Body (JSON)</Label>
              <SmartInput
                type="textarea"
                value={body}
                onChange={setBody}
                placeholder='{"key": "value"}'
                className="font-mono text-xs h-24"
              />
            </div>
          )}

          {/* Timeout */}
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Timeout:</Label>
            <Input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(Number(e.target.value))}
              className="w-20"
              min={1}
              max={60}
            />
            <span className="text-sm text-muted-foreground">seconds</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
          Save
        </Button>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle
              className={`text-sm ${
                testResult.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {testResult.success
                ? `✓ ${testResult.statusCode} ${testResult.statusText}`
                : `✗ ${testResult.error}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
              {JSON.stringify(testResult.body || testResult.response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Output Info */}
      <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground">
        <p>
          <strong>Output:</strong> statusCode, headers, body, success, duration
        </p>
      </div>
    </div>
  );
};

export default HttpRequestWizard;
