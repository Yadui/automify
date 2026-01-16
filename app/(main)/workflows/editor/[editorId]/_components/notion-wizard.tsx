"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
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
  FileText,
  Database,
  Plus,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import RenderConnectionAccordion from "./render-connection-accordion";
import SmartInput from "./smart-input";
import { parseVariables } from "@/lib/utils";
import { CONNECTIONS } from "@/lib/constant";
import {
  getNotionConnection,
  getNotionDatabases,
  onCreateNewPageInDatabase,
} from "../../../../connections/_actions/notion-connection";

type Step = 1 | 2 | 3 | 4 | 5;

const NOTION_EVENTS = [
  {
    id: "create_item",
    label: "Create entries directly in notion",
    description: "Add a new page to a Notion database.",
  },
];

export const NotionWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [notionInfo, setNotionInfo] = useState<{
    accessToken: string;
    workspaceName: string;
    workspaceIcon: string;
  } | null>(null);

  // Database selection
  const [databases, setDatabases] = useState<
    { id: string; title: string; icon: string }[]
  >([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);

  // Form state
  const [config, setConfig] = useState({
    event: "create_item",
    content: "",
    databaseId: "",
    databaseName: "",
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

  // Fetch Notion connection on step 1
  useEffect(() => {
    const fetchNotion = async () => {
      setLoading(true);
      try {
        const info = await getNotionConnection();
        if (info) {
          setNotionInfo({
            accessToken: info.accessToken,
            workspaceName: info.workspaceName || "Notion Workspace",
            workspaceIcon: info.workspaceIcon || "📚",
          });
        }
      } catch (e) {
        console.error("Failed to fetch Notion connection:", e);
      }
      setLoading(false);
    };
    if (step === 1) {
      fetchNotion();
    }
  }, [step]);

  // Fetch databases when entering step 2
  useEffect(() => {
    const fetchDatabases = async () => {
      if (!notionInfo?.accessToken) return;
      setLoadingDatabases(true);
      try {
        const result = await getNotionDatabases(notionInfo.accessToken);
        if (result.databases) {
          setDatabases(result.databases);
        }
        if (result.error) {
          toast.error("Failed to fetch databases: " + result.error);
        }
      } catch (e) {
        console.error("Failed to fetch Notion databases:", e);
      }
      setLoadingDatabases(false);
    };
    if (step === 2 && notionInfo?.accessToken) {
      fetchDatabases();
    }
  }, [step, notionInfo?.accessToken]);

  const refreshDatabases = async () => {
    if (!notionInfo?.accessToken) return;
    setLoadingDatabases(true);
    try {
      const result = await getNotionDatabases(notionInfo.accessToken);
      if (result.databases) {
        setDatabases(result.databases);
        toast.success("Databases refreshed");
      }
    } catch (e) {
      toast.error("Failed to refresh databases");
    }
    setLoadingDatabases(false);
  };

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

  const selectDatabase = (db: { id: string; title: string; icon: string }) => {
    // Update both values atomically to avoid race conditions
    const newConfig = {
      ...config,
      databaseId: db.id,
      databaseName: db.title,
    };
    setConfig(newConfig);

    // Sync to Node in a single dispatch
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
                    databaseId: db.id,
                    databaseName: db.title,
                  },
                },
              }
            : node
        ),
      },
    });

    toast.success(`Selected: ${db.title}`);
  };

  const onTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const parsedContent = parseVariables(
        config.content,
        state.editor.elements
      );

      if (!parsedContent) {
        toast.error("Content is required");
        setLoading(false);
        return;
      }

      const accessToken = notionInfo?.accessToken;
      const databaseId = config.databaseId;

      if (!accessToken || !databaseId) {
        toast.error("Notion not connected or database not selected");
        setLoading(false);
        return;
      }

      const result = await onCreateNewPageInDatabase(
        databaseId,
        accessToken,
        parsedContent
      );

      if (result && result.id) {
        setTestResult({
          success: true,
          pageId: result.id,
          databaseName: config.databaseName || "Notion Database",
          workspaceName: notionInfo?.workspaceName || "Notion",
          content: parsedContent,
          createdAt: new Date().toISOString(),
        });
        toast.success("Test entry created in Notion!");
      } else {
        toast.error("Failed to create entry");
      }
    } catch (e: any) {
      toast.error(e?.message || "An error occurred");
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
                    eventLabel: `Add to: ${config.databaseName || "Notion"}`,
                    workspaceName: notionInfo?.workspaceName,
                    sampleData: testResult,
                  },
                },
              }
            : node
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("Notion node configured!");
  };

  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Database", icon: Database },
    { id: 3, title: "Event", icon: Settings2 },
    { id: 4, title: "Content", icon: FileText },
    { id: 5, title: "Test", icon: PlayCircle },
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
                Connect Notion Workspace
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "Notion").map(
                  (connection) => (
                    <RenderConnectionAccordion
                      key={connection.title}
                      state={state}
                      connection={connection}
                    />
                  )
                )}
              </div>

              {notionInfo && (
                <div className="p-4 rounded-xl border bg-green-500/5 border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-lg">
                      {notionInfo.workspaceIcon || "📚"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {notionInfo.workspaceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connected workspace
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  </div>
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!notionInfo}
            >
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  Select Database
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshDatabases}
                  disabled={loadingDatabases}
                >
                  <RefreshCw
                    className={clsx(
                      "w-4 h-4",
                      loadingDatabases && "animate-spin"
                    )}
                  />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Select the Notion database where new pages will be created.
              </p>

              {loadingDatabases ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : databases.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed rounded-xl space-y-3">
                  <Database className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    No databases found in your workspace.
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    Make sure you've shared at least one database with this
                    integration during OAuth.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {databases.map((db) => (
                    <div
                      key={db.id}
                      role="button"
                      tabIndex={0}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        selectDatabase(db);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        selectDatabase(db);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectDatabase(db);
                        }
                      }}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none",
                        config.databaseId === db.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-lg pointer-events-none">
                        {db.icon}
                      </span>
                      <span className="truncate text-sm pointer-events-none">
                        {db.title}
                      </span>
                      {config.databaseId === db.id && (
                        <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                disabled={!config.databaseId}
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
                <Settings2 className="w-4 h-4 text-primary" />
                Select Action
              </label>
              <div className="grid gap-3">
                {NOTION_EVENTS.map((evt) => (
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
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!config.event}
                onClick={() => setStep(4)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Configure Entry
              </label>

              <div className="p-3 rounded-lg bg-muted/50 text-xs flex items-center gap-2">
                <span className="text-muted-foreground">Database: </span>
                <span className="font-medium">
                  {config.databaseName || "Selected Database"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase">
                Page Title / Name <span className="text-red-500">*</span>
              </Label>
              <SmartInput
                value={config.content}
                onChange={(v) => updateConfig("content", v)}
                placeholder="Enter page title... Use {{nodeId.variable}} for dynamic values"
              />
              <p className="text-[10px] text-muted-foreground">
                This will be the title of the new page created in your Notion
                database.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(3)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!config.content}
                onClick={() => setStep(5)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <div
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                testResult
                  ? "bg-green-100 text-green-600"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              {testResult ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Plus className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold">
                {testResult ? "Entry Created!" : "Ready to Test"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                {testResult
                  ? `A new page was created in ${testResult.databaseName}`
                  : `We'll create a test entry in "${config.databaseName}".`}
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
                Create Test Entry
              </Button>
            )}

            {testResult && (
              <div className="text-left p-4 rounded-xl border bg-muted/30 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database:</span>
                  <span className="font-medium">{testResult.databaseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page ID:</span>
                  <span className="font-mono text-[10px]">
                    {testResult.pageId?.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-green-600">Created</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(4)}
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

export default NotionWizard;
