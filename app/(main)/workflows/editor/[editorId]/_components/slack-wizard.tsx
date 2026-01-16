"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
import { useNodeConnections } from "@/providers/connection-provider";
import { CONNECTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Settings2,
  User2,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Hash,
  Send,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import RenderConnectionAccordion from "./render-connection-accordion";
import SmartInput from "./smart-input";
import { parseVariables } from "@/lib/utils";
import {
  listBotChannels,
  postMessageToSlack,
} from "../../../../connections/_actions/slack-connection";
import { useFuzzieStore } from "@/store";

type Step = 1 | 2 | 3 | 4;

const SLACK_EVENTS = [
  {
    id: "send_message",
    label: "Send a notification to slack",
    description: "Post a message to one or more Slack channels.",
  },
];

export const SlackWizard = () => {
  const { state, dispatch } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const {
    slackChannels,
    setSlackChannels,
    selectedSlackChannels,
    setSelectedSlackChannels,
  } = useFuzzieStore();
  const selectedNode = state.editor.selectedNode;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Form state
  const [config, setConfig] = useState({
    event: "send_message",
    message: "",
    channels: [] as string[],
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

  // Fetch channels when we have access token
  useEffect(() => {
    const fetchChannels = async () => {
      if (
        nodeConnection.slackNode.slackAccessToken &&
        slackChannels.length === 0
      ) {
        setLoading(true);
        try {
          const channels = await listBotChannels(
            nodeConnection.slackNode.slackAccessToken
          );
          setSlackChannels(channels);
        } catch (e) {
          console.error("Failed to fetch Slack channels:", e);
        }
        setLoading(false);
      }
    };
    if (step === 3) {
      fetchChannels();
    }
  }, [
    step,
    nodeConnection.slackNode.slackAccessToken,
    slackChannels.length,
    setSlackChannels,
  ]);

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

  const toggleChannel = (channelId: string, channelLabel: string) => {
    const isSelected = selectedSlackChannels.some(
      (c: any) => c.value === channelId
    );
    let newSelection;
    if (isSelected) {
      newSelection = selectedSlackChannels.filter(
        (c: any) => c.value !== channelId
      );
    } else {
      newSelection = [
        ...selectedSlackChannels,
        { value: channelId, label: channelLabel },
      ];
    }
    setSelectedSlackChannels(newSelection);
    updateConfig(
      "channels",
      newSelection.map((c: any) => c.value)
    );
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

      if (selectedSlackChannels.length === 0) {
        toast.error("Please select at least one channel");
        setLoading(false);
        return;
      }

      const result = await postMessageToSlack(
        nodeConnection.slackNode.slackAccessToken,
        selectedSlackChannels,
        parsedMessage
      );

      if (result.message === "Success") {
        setTestResult({
          success: true,
          channels: selectedSlackChannels.map((c: any) => c.label).join(", "),
          message: parsedMessage,
          sentAt: new Date().toISOString(),
        });
        toast.success("Test message sent to Slack!");
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
    setLoading(false);
  };

  const onFinish = () => {
    const channelNames = selectedSlackChannels
      .map((c: any) => c.label)
      .join(", ");
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
                    eventLabel: `Send a notification to slack`,
                    channelNames,
                    sampleData: testResult,
                  },
                },
              }
            : node
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("Slack node configured!");
  };

  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Event", icon: Settings2 },
    { id: 3, title: "Configure", icon: MessageSquare },
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
                Connect Slack Workspace
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "Slack").map(
                  (connection) => (
                    <RenderConnectionAccordion
                      key={connection.title}
                      state={state}
                      connection={connection}
                    />
                  )
                )}
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
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
                {SLACK_EVENTS.map((evt) => (
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
                <Hash className="w-4 h-4 text-primary" />
                Select Channels
              </label>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {slackChannels.map((channel: any) => {
                    const isSelected = selectedSlackChannels.some(
                      (c: any) => c.value === channel.value
                    );
                    return (
                      <div
                        key={channel.value}
                        onClick={() =>
                          toggleChannel(channel.value, channel.label)
                        }
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm",
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <Hash className="w-4 h-4 shrink-0" />
                        <span className="truncate">{channel.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />
                        )}
                      </div>
                    );
                  })}
                  {slackChannels.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed rounded-xl">
                      <Hash className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        No channels found. Make sure the bot is invited to
                        channels.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase">
                Message <span className="text-red-500">*</span>
              </Label>
              <SmartInput
                value={config.message}
                onChange={(v) => updateConfig("message", v)}
                type="textarea"
                className="min-h-[120px]"
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
                disabled={!config.message || selectedSlackChannels.length === 0}
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
                  : "bg-primary/10 text-primary"
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
                  ? `Your test message was sent to ${selectedSlackChannels
                      .map((c: any) => c.label)
                      .join(", ")}`
                  : `We'll send a test message to your selected channels.`}
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
                  <span className="text-muted-foreground">Channels:</span>
                  <span className="font-medium">{testResult.channels}</span>
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

export default SlackWizard;
