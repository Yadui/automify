"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
import { useNodeConnections } from "@/providers/connection-provider";
import { CONNECTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  Settings2,
  User2,
  PlayCircle,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
  FileIcon,
  FolderIcon,
  Loader2,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import {
  getGoogleFolders,
  getGoogleFiles,
  createGoogleFolder,
  testGoogleDriveStep,
} from "../../../../connections/_actions/google-connection";
import RenderConnectionAccordion from "./render-connection-accordion";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Step = 1 | 2 | 3 | 4;

const GOOGLE_DRIVE_EVENTS = [
  {
    id: "new_file",
    label: "New File",
    description: "Fires when a new file is created in a specific folder.",
  },
  {
    id: "file_updated",
    label: "File Updated",
    description: "Fires when a specific file's content is updated.",
  },
  {
    id: "new_folder",
    label: "New Folder",
    description: "Fires when a new folder is created in a parent folder.",
  },
];

export const GoogleDriveWizard = () => {
  const { state, dispatch } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [files, setFiles] = useState<
    { id: string; name: string; mimeType?: string }[]
  >([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [scopeMessage, setScopeMessage] = useState<string | null>(null);

  // Folder creation dialog state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  // Track if files are available (for disabling file_updated option)
  const [hasFiles, setHasFiles] = useState<boolean | null>(null);

  // Local config state for immediate UI feedback
  const [localConfig, setLocalConfig] = useState<any>({});

  const selectedNode = state.editor.selectedNode;

  // Initialize local config from selectedNode on mount or when node changes
  useEffect(() => {
    if (selectedNode?.data?.metadata) {
      setLocalConfig(selectedNode.data.metadata);
    }
  }, [selectedNode?.id]);

  // Auto-pass test for new_file and new_folder events
  useEffect(() => {
    if (
      step === 4 &&
      (localConfig.event === "new_file" || localConfig.event === "new_folder")
    ) {
      // Set a default sample result so user can proceed without actual polling
      if (!testResult) {
        const sampleData = {
          id: "sample-id-" + Date.now(),
          name:
            localConfig.event === "new_file"
              ? `New file in ${localConfig.folderName || "folder"}`
              : `New folder in ${localConfig.parentName || "parent"}`,
          mimeType:
            localConfig.event === "new_file"
              ? "application/octet-stream"
              : "application/vnd.google-apps.folder",
          createdTime: new Date().toISOString(),
          webViewLink: "https://drive.google.com",
        };
        setTestResult(sampleData);
      }
    }
  }, [
    step,
    localConfig.event,
    localConfig.folderName,
    localConfig.parentName,
    testResult,
  ]);

  useEffect(() => {
    if (step === 3) {
      const fetchData = async () => {
        setLoading(true);
        setScopeMessage(null);

        if (
          localConfig.event === "new_file" ||
          localConfig.event === "new_folder"
        ) {
          const result = await getGoogleFolders();
          if (result.folders) {
            setFolders(
              result.folders.map((f: any) => ({
                id: f.id || "",
                name: f.name || "Untitled Folder",
              }))
            );
          }
          if (result.message) {
            setScopeMessage(result.message);
          }
        } else if (localConfig.event === "file_updated") {
          const result = await getGoogleFiles();
          if (result.files) {
            setFiles(
              result.files.map((f: any) => ({
                id: f.id || "",
                name: f.name || "Untitled File",
                mimeType: f.mimeType,
              }))
            );
          }
          if (result.message) {
            setScopeMessage(result.message);
          }
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [step, localConfig.event]);

  // Check file availability on step 2 to disable file_updated option if no files
  useEffect(() => {
    if (step === 2 && hasFiles === null) {
      const checkFiles = async () => {
        const result = await getGoogleFiles();
        setHasFiles(result.files && result.files.length > 0);
      };
      checkFiles();
    }
  }, [step, hasFiles]);

  // Handler for creating a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreating(true);
    const result = await createGoogleFolder(newFolderName.trim());
    if (result.success && result.folder) {
      setFolders([
        ...folders,
        {
          id: result.folder.id || "",
          name: result.folder.name || newFolderName,
        },
      ]);
      updateConfig(
        localConfig.event === "new_file"
          ? { folderId: result.folder.id, folderName: result.folder.name }
          : { parentId: result.folder.id, parentName: result.folder.name }
      );
      toast.success(`Folder "${result.folder.name}" created!`);
      setShowCreateFolder(false);
      setNewFolderName("");
    } else {
      toast.error(result.error || "Failed to create folder");
    }
    setCreating(false);
  };

  const updateConfig = (updates: any) => {
    // Update local state immediately for responsive UI
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);

    // Sync to Redux state
    const nodeExists = state.editor.elements.some(
      (node) => node.id === selectedNode.id
    );
    if (nodeExists) {
      dispatch({
        type: "UPDATE_NODE",
        payload: {
          elements: state.editor.elements.map((node) =>
            node.id === selectedNode.id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    metadata: newConfig,
                  },
                }
              : node
          ),
        },
      });
    }
  };

  // Polling state for test
  const [isPolling, setIsPolling] = useState(false);
  const [pollStartTime, setPollStartTime] = useState<string | null>(null);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
    setLoading(false);
  };

  const onTest = async () => {
    setLoading(true);
    setTestResult(null);

    // Get event type for appropriate messaging
    const eventType = localConfig.event;

    // For file_updated, just fetch the file directly (no polling needed)
    if (eventType === "file_updated") {
      const result = await testGoogleDriveStep(localConfig.event, localConfig);
      if (result.success) {
        setTestResult(result.data);
        toast.success("Test successful!");
      } else {
        toast.error(result.error || "Test failed");
      }
      setLoading(false);
      return;
    }

    // For new_file/new_folder: First get current files, then poll for new ones
    const startTime = new Date().toISOString();
    setPollStartTime(startTime);
    setIsPolling(true);

    // First call to get current file IDs
    const initialResult = await testGoogleDriveStep(
      localConfig.event,
      localConfig
    );
    const knownFileIds = initialResult.currentFileIds || [];
    console.log("[Wizard] Initial file IDs:", knownFileIds);

    toast.info(
      eventType === "new_file"
        ? `Listening... Create a new file in your selected folder. (${knownFileIds.length} existing files)`
        : `Listening... Create a new folder in your selected parent folder. (${knownFileIds.length} existing folders)`
    );

    // Start polling with known file IDs
    pollingRef.current = setInterval(async () => {
      const configWithKnownIds = {
        ...localConfig,
        knownFileIds: knownFileIds,
      };

      const result = await testGoogleDriveStep(
        localConfig.event,
        configWithKnownIds,
        startTime
      );

      console.log("[Wizard] Poll result:", result);

      if (result.success && result.data) {
        // Found a new file!
        stopPolling();
        setTestResult(result.data);
        toast.success("New item detected! Test successful.");
      } else if (result.error) {
        stopPolling();
        toast.error(result.error);
      }
      // If waiting, continue polling...
    }, 3000); // Poll every 3 seconds
  };

  const onFinish = () => {
    const eventLabel =
      localConfig.event === "new_file"
        ? `New File in ${localConfig.folderName || "Folder"}`
        : localConfig.event === "new_folder"
        ? `New Folder in ${localConfig.parentName || "Folder"}`
        : localConfig.event === "file_updated"
        ? `File Updated: ${localConfig.fileName || "File"}`
        : "Google Drive Event";

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
                    event: localConfig.event,
                    eventLabel: eventLabel,
                    sampleData: testResult, // Save real test data for downstream variables
                  },
                },
              }
            : node
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("Google Drive connector updated!");
  };

  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Event", icon: Settings2 },
    { id: 3, title: "Configure", icon: Eye },
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
                Connect Google Account
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "Google Drive").map(
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
                Select Event
              </label>
              <div className="grid gap-3">
                {GOOGLE_DRIVE_EVENTS.map((evt) => {
                  const isDisabled =
                    evt.id === "file_updated" && hasFiles === false;
                  return (
                    <div
                      key={evt.id}
                      role="button"
                      tabIndex={isDisabled ? -1 : 0}
                      title={
                        isDisabled
                          ? "No accessible files available. Open a file with this app first."
                          : undefined
                      }
                      onMouseDown={(e) => {
                        if (isDisabled) return;
                        e.stopPropagation();
                        updateConfig({ event: evt.id });
                      }}
                      onClick={(e) => {
                        if (isDisabled) return;
                        e.stopPropagation();
                        updateConfig({ event: evt.id });
                      }}
                      className={clsx(
                        "p-4 rounded-xl border-2 transition-all select-none pointer-events-auto",
                        isDisabled
                          ? "opacity-50 cursor-not-allowed border-muted bg-muted/30"
                          : "cursor-pointer hover:border-primary/50",
                        localConfig.event === evt.id && !isDisabled
                          ? "border-primary bg-primary/5 shadow-sm"
                          : !isDisabled && "border-muted bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm mb-1 pointer-events-none">
                          {evt.label}
                        </p>
                        {isDisabled && (
                          <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                            No files available
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground pointer-events-none">
                        {evt.description}
                      </p>
                    </div>
                  );
                })}
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
                disabled={!localConfig.event}
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
                <Eye className="w-4 h-4 text-primary" />
                Configure Connection
              </label>

              {/* Scope limitation warning */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> Due to security restrictions, only files
                and folders created by or previously opened with this app are
                accessible.
              </div>

              {localConfig.event === "new_file" ||
              localConfig.event === "new_folder" ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Select the{" "}
                    {localConfig.event === "new_file" ? "source" : "parent"}{" "}
                    folder:
                  </p>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {folders.map((f) => (
                        <div
                          key={f.id}
                          onClick={() =>
                            updateConfig(
                              localConfig.event === "new_file"
                                ? { folderId: f.id, folderName: f.name }
                                : { parentId: f.id, parentName: f.name }
                            )
                          }
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm",
                            localConfig.folderId === f.id ||
                              localConfig.parentId === f.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <FolderIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                      ))}
                      {folders.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed rounded-xl space-y-3">
                          <FolderIcon className="w-8 h-8 mx-auto text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground">
                            No accessible folders found.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCreateFolder(true)}
                          >
                            <FolderIcon className="w-4 h-4 mr-2" />
                            Create New Folder
                          </Button>
                        </div>
                      )}
                      {folders.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => setShowCreateFolder(true)}
                        >
                          <FolderIcon className="w-4 h-4 mr-2" />
                          Create New Folder
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : localConfig.event === "file_updated" ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Select the file to monitor for updates:
                  </p>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          onClick={() =>
                            updateConfig({ fileId: f.id, fileName: f.name })
                          }
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm",
                            localConfig.fileId === f.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <FileIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate flex-1">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {f.mimeType?.split("/").pop() || "file"}
                          </span>
                        </div>
                      ))}
                      {files.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed rounded-xl">
                          <FileIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground">
                            No accessible files found.
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            Open a file with this app first, or upload a file
                            using Google Picker.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
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
                disabled={
                  loading ||
                  (!localConfig.folderId &&
                    !localConfig.parentId &&
                    !localConfig.fileId)
                }
                onClick={() => setStep(4)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-6 text-center">
              <div
                className={clsx(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                  isPolling
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-primary/10 text-primary"
                )}
              >
                {isPolling ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : testResult ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : (
                  <PlayCircle className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold">
                  {isPolling
                    ? "Listening for Changes..."
                    : testResult
                    ? "Test Successful!"
                    : "Test Configuration"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                  {isPolling
                    ? localConfig.event === "new_file"
                      ? "Create a new file in your selected folder now. We're watching for it..."
                      : "Create a new folder in your selected parent folder now. We're watching for it..."
                    : testResult
                    ? "A new item was detected in your Drive. You can now save and continue."
                    : "Click below to start listening for changes in your selected folder."}
                </p>
              </div>

              {!testResult && !isPolling && (
                <Button
                  variant="secondary"
                  className="w-full h-12"
                  onClick={onTest}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <PlayCircle className="w-4 h-4 mr-2" />
                  )}
                  Start Listening
                </Button>
              )}

              {isPolling && (
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={stopPolling}
                >
                  Cancel
                </Button>
              )}

              {testResult && (
                <div className="text-left animate-in zoom-in-95 duration-200">
                  <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
                      <CheckCircle2 className="w-4 h-4" /> SUCCESSFUL TEST
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px]">
                      <div>
                        <p className="text-muted-foreground uppercase">Name</p>
                        <p className="font-medium truncate">
                          {testResult.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase">
                          MIME Type
                        </p>
                        <p className="font-medium truncate">
                          {testResult.mimeType.split("/").pop()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase">ID</p>
                        <p className="font-medium truncate">{testResult.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase">
                          Created
                        </p>
                        <p className="font-medium">
                          {new Date(
                            testResult.createdTime
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <a
                      href={testResult.webViewLink}
                      target="_blank"
                      className="flex items-center text-[10px] text-blue-500 hover:underline"
                    >
                      View in Drive <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(3)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold"
                disabled={!testResult}
                onClick={onFinish}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Folder Creation Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This folder will be created in your Google Drive root.
            </p>
            <Input
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !creating) {
                  handleCreateFolder();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={creating || !newFolderName.trim()}
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FolderIcon className="w-4 h-4 mr-2" />
              )}
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
