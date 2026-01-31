"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
import { useNodeConnections } from "@/providers/connection-provider";
import { CONNECTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  PlayCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Mail,
  User2,
  PenLine,
  ChevronDown,
  Settings2,
  FileEdit,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import {
  sendGmail,
  testGmailConnection,
} from "../../../../../connections/_actions/google-gmail-action";
import { getGoogleConnection } from "@/app/(main)/connections/_actions/google-connection";
import RenderConnectionAccordion from "../render-connection-accordion";
import SmartInput from "../smart-input";
import { parseVariables } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

export const GmailWizard = () => {
  const { state, dispatch } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const selectedNode = state.editor.selectedNode;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);

  // Form State
  const [config, setConfig] = useState({
    to: "",
    subject: "",
    message: "", // Body
    cc: "",
    bcc: "",
  });

  const [connectedEmail, setConnectedEmail] = useState<string>(
    "Connected Google Account",
  );

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const connection = await getGoogleConnection();
        if (connection) {
          const meta = connection.metadata as any;
          const email = meta?.email || meta?.emailAddress;
          if (email) setConnectedEmail(email);
        }
      } catch (error) {
        console.error("Failed to fetch Google connection email:", error);
      }
    };
    fetchEmail();
  }, []);

  const [testResult, setTestResult] = useState<any>(null);

  // Initialize from metadata
  useEffect(() => {
    if (selectedNode?.data?.metadata) {
      setConfig((prev) => ({
        ...prev,
        ...selectedNode.data.metadata,
      }));
    }
  }, [selectedNode?.id]);

  const updateConfig = (key: string, value: string) => {
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
            : node,
        ),
      },
    });
  };

  const onTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const parsedConfig = {
        to: parseVariables(config.to, state.editor.elements),
        subject: parseVariables(config.subject, state.editor.elements),
        message: parseVariables(config.message, state.editor.elements),
        cc: parseVariables(config.cc, state.editor.elements),
        bcc: parseVariables(config.bcc, state.editor.elements),
      };

      if (!isDryRun && !parsedConfig.to) {
        toast.error("Recipient email is required for sending");
        setLoading(false);
        return;
      }

      if (isDryRun) {
        const result = await testGmailConnection();
        if (result.success) {
          setTestResult({ ...result.data, isDryRun: true });
          toast.success("Connection validated successfully!");
        } else {
          toast.error(result.error || "Failed to validate connection");
        }
      } else {
        const result = await sendGmail(parsedConfig);
        if (result.success) {
          setTestResult(result.data);
          toast.success("Test email sent!");
        } else {
          toast.error(result.error || "Failed to send test email");
        }
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
                    eventLabel: `Email to: ${config.to}`,
                    sampleData: testResult
                      ? {
                          messageId: testResult.messageId || "mock-id",
                          threadId: testResult.threadId || "mock-thread",
                          sentAt: new Date().toISOString(),
                          to: config.to,
                          subject: config.subject,
                          message: config.message,
                        }
                      : undefined,
                  },
                },
              }
            : node,
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("Gmail node configured!");
  };

  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Details", icon: Settings2 },
    { id: 3, title: "Message", icon: FileEdit },
    { id: 4, title: "Test", icon: PlayCircle },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
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
                  step === s.id && "ring-4 ring-primary/20",
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
                  step >= s.id ? "text-primary" : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" />
                Connect Gmail Account
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "Gmail").map(
                  (connection) => (
                    <RenderConnectionAccordion
                      key={connection.title}
                      state={state}
                      connection={connection}
                    />
                  ),
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
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  From
                </Label>
                <div className="p-2 border rounded-md bg-muted text-sm text-muted-foreground">
                  {connectedEmail}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase">
                  To <span className="text-red-500">*</span>
                </Label>
                <SmartInput
                  value={config.to}
                  onChange={(v) => updateConfig("to", v)}
                  placeholder="recipient@example.com"
                />
              </div>

              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-0 text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                >
                  <ChevronDown
                    className={clsx(
                      "w-3 h-3 transition-transform",
                      showCcBcc && "rotate-180",
                    )}
                  />{" "}
                  Show CC & BCC
                </Button>
                {showCcBcc && (
                  <div className="space-y-3 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold uppercase">
                        CC
                      </Label>
                      <SmartInput
                        value={config.cc}
                        onChange={(v) => updateConfig("cc", v)}
                        placeholder="cc@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold uppercase">
                        BCC
                      </Label>
                      <SmartInput
                        value={config.bcc}
                        onChange={(v) => updateConfig("bcc", v)}
                        placeholder="bcc@example.com"
                      />
                    </div>
                  </div>
                )}
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
                disabled={!config.to}
                onClick={() => setStep(3)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <SmartInput
                  value={config.subject}
                  onChange={(v) => updateConfig("subject", v)}
                  placeholder="Email Subject"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold uppercase">
                  Message Body
                </Label>
                <SmartInput
                  value={config.message}
                  onChange={(v) => updateConfig("message", v)}
                  type="textarea"
                  className="min-h-[300px]"
                  enableRichToolbar={true}
                />
              </div>
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
                disabled={!config.subject}
                onClick={() => setStep(4)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-blue-100 text-blue-600">
              {testResult ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <Mail className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold">
                {testResult
                  ? testResult.isDryRun
                    ? "Validation Successful!"
                    : "Test Email Sent!"
                  : "Ready to Test"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                {testResult
                  ? testResult.isDryRun
                    ? "Credentials verified. This node is ready to run."
                    : "Your test email was sent successfully."
                  : isDryRun
                    ? "We'll validate your authentication and inputs without sending an email."
                    : `We'll send a test email to ${config.to}. Make sure the address is correct.`}
              </p>
            </div>

            {!testResult && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 justify-center p-3 rounded-lg bg-muted/30 border border-muted/50">
                  <Switch
                    id="dry-run"
                    checked={isDryRun}
                    onCheckedChange={setIsDryRun}
                  />
                  <Label htmlFor="dry-run" className="text-sm cursor-pointer">
                    Validate Only (Dry Run)
                  </Label>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={onTest}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : isDryRun ? (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {isDryRun ? "Validate Configuration" : "Send Test Email"}
                </Button>
              </div>
            )}

            {testResult && (
              <div className="text-left p-4 rounded-xl border bg-muted/30 space-y-2 text-xs">
                {testResult.isDryRun ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auth:</span>
                      <span className="font-bold text-green-600">Valid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account:</span>
                      <span className="font-medium">
                        {testResult.emailAddress}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Message ID:</span>
                      <span className="font-mono">{testResult.messageId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-bold text-green-600">Sent</span>
                    </div>
                  </>
                )}
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

export default GmailWizard;
