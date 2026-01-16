"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
import { CONNECTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Settings2,
  User2,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Send,
  Server,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import RenderConnectionAccordion from "./render-connection-accordion";
import SmartInput from "./smart-input";
import { parseVariables } from "@/lib/utils";
import {
  getDiscordConnectionUrl,
  postContentToWebHook,
} from "../../../../connections/_actions/discord-connections";

type Step = 1 | 2 | 3 | 4;

const DISCORD_EVENTS = [
  {
    id: "send_message",
    label: "Post messages to your discord server",
    description: "Send a message to a Discord channel via webhook.",
  },
];

export const DiscordWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [webhookInfo, setWebhookInfo] = useState<{
    url: string;
    name: string;
    guildName: string;
  } | null>(null);

  // Form state
  const [config, setConfig] = useState({
    event: "send_message",
    message: "",
  });

  // Initialize from metadata
  useEffect(() => {
    if (selectedNode?.data?.metadata) {
      setConfig((prev) => ({
        ...prev,
        ...selectedNode.data.metadata,
      }));
    }
  }, [selectedNode?.id]);

  // Fetch webhook info on mount and when step changes
  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchWebhook = async () => {
      setLoading(true);
      try {
        const info = await getDiscordConnectionUrl();
        if (info && info.url && !info.needsReconnect) {
          setWebhookInfo(info as any);
        } else if (info?.needsReconnect) {
          // Invalid old connection - user needs to reconnect
          setWebhookInfo(null);
          toast.error(
            "Discord connection expired. Please reconnect to get a new webhook."
          );
        }
      } catch (e) {
        console.error("Failed to fetch Discord webhook:", e);
      }
      setLoading(false);
    };
    fetchWebhook();
  }, []);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    // Sync to Node
    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  metadata: {
                    ...node.data.metadata,
                    [key]: value,
                  },
                },
              }
            : node
        ),
      },
    });
  };

  const onTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const parsedMessage = parseVariables(
        config.message,
        state.editor.elements
      );

      if (!parsedMessage) {
        toast.error("Message content is required");
        setLoading(false);
        return;
      }

      if (!webhookInfo?.url) {
        toast.error("Discord webhook not connected. Please connect first.");
        setLoading(false);
        return;
      }

      const result = await postContentToWebHook(parsedMessage, webhookInfo.url);

      if (result.message === "success") {
        setTestResult({
          success: true,
          webhookName: webhookInfo?.name || "Discord Channel",
          message: parsedMessage,
          sentAt: new Date().toISOString(),
        });
        toast.success("Test message sent to Discord!");
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
    setLoading(false);
  };

  const onFinish = () => {
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
                    ...config,
                    eventLabel: `Post to: ${webhookInfo?.name || "Discord"}`,
                    webhookName: webhookInfo?.name,
                    sampleData: testResult,
                  },
                },
              }
            : node
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("Discord node configured!");
  };

  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Event", icon: Settings2 },
    { id: 3, title: "Message", icon: MessageSquare },
    { id: 4, title: "Test", icon: PlayCircle },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0" />
          {steps.map((s) => (
            <div
              key={s.id}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  step >= s.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground",
                  step === s.id && "ring-4 ring-primary/20"
                )}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium",
                  step >= s.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" />
                Connect Discord Channel
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "Discord").map(
                  (connection) => (
                    <RenderConnectionAccordion
                      key={connection.title}
                      state={state}
                      connection={connection}
                    />
                  )
                )}
              </div>

              {webhookInfo && (
                <div className="p-4 rounded-xl border bg-green-500/5 border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {webhookInfo.name || "Discord Webhook"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Channel connected via OAuth
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  </div>
                </div>
              )}

              {!webhookInfo && !loading && (
                <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> Click "Connect" above to authorize.
                    Discord will ask you to select a channel for sending
                    messages.
                  </p>
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!webhookInfo}
            >
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Select Action
              </label>
              <div className="grid gap-3">
                {DISCORD_EVENTS.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => updateConfig("event", evt.id)}
                    className={clsx(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      config.event === evt.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-card hover:border-primary/50"
                    )}
                  >
                    <p className="font-bold text-sm mb-1">{evt.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!config.event}
                onClick={() => setStep(3)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Compose Message
              </label>

              {webhookInfo && (
                <div className="p-3 rounded-lg bg-muted/50 text-xs">
                  <span className="text-muted-foreground">Sending to: </span>
                  <span className="font-medium">
                    {webhookInfo.name || "Discord Channel"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase">
                Message <span className="text-red-500">*</span>
              </Label>
              <SmartInput
                value={config.message}
                onChange={(v) => updateConfig("message", v)}
                type="textarea"
                className="min-h-[150px]"
                placeholder="Enter your message... Use {{nodeId.variable}} for dynamic values"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!config.message}
                onClick={() => setStep(4)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <div
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                testResult
                  ? "bg-green-100 text-green-600"
                  : "bg-indigo-100 text-indigo-600"
              )}
            >
              {testResult ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Send className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold">
                {testResult ? "Message Sent!" : "Ready to Test"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                {testResult
                  ? `Your test message was sent to ${testResult.webhookName}`
                  : `We'll send a test message to your Discord channel.`}
              </p>
            </div>

            {!testResult && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={onTest}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Send Test Message
              </Button>
            )}

            {testResult && (
              <div className="text-left p-4 rounded-xl border bg-muted/30 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel:</span>
                  <span className="font-medium">{testResult.webhookName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-green-600">Delivered</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(3)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2] bg-green-600 hover:bg-green-700 font-bold text-white"
                disabled={!testResult}
                onClick={onFinish}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscordWizard;
