"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
import { useNodeConnections } from "@/providers/connection-provider";
import { CONNECTIONS, EditorCanvasDefaultCardTypes } from "@/lib/constant";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  User2,
  PlayCircle,
  Eye,
  Info,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import EditorCanvasIconHelper from "./editor-canvas-card-icon-hepler";
import RenderConnectionAccordion from "./render-connection-accordion";
import RenderOutputAccordion from "./render-output-accordian";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFuzzieStore } from "@/store";
import { fetchBotSlackChannels, onConnections } from "@/lib/editor-utils";
import { toast } from "sonner";
import { GoogleDriveWizard } from "./google-drive-wizard";

const APP_EVENTS: Record<string, { label: string; value: string }[]> = {
  "Google Drive": [
    { label: "New File", value: "new_file" },
    { label: "File Updated", value: "file_updated" },
    { label: "New Folder", value: "new_folder" },
  ],
  Slack: [
    { label: "Send Message", value: "send_message" },
    { label: "Update Channel", value: "update_channel" },
  ],
  Discord: [{ label: "Send Message", value: "send_message" }],
  Notion: [
    { label: "Create Database Item", value: "create_item" },
    { label: "Update Page", value: "update_page" },
  ],
};

import HttpRequestWizard from "./core-primitives/http-request-wizard";
import WebhookWizard from "./core-primitives/webhook-wizard";
import WaitWizard from "./core-primitives/wait-wizard";
import EndWizard from "./core-primitives/end-wizard";
import ConditionWizard from "./core-primitives/condition-wizard";
import DataTransformWizard from "./core-primitives/data-transform-wizard";
import KVStorageWizard from "./core-primitives/kv-storage-wizard";
import ToastWizard from "./core-primitives/toast-wizard";
import GmailWizard from "./core-primitives/gmail-wizard";
import SlackWizard from "./slack-wizard";
import DiscordWizard from "./discord-wizard";
import NotionWizard from "./notion-wizard";
import TriggerWizard from "./core-primitives/trigger-wizard";

const EditorCanvasSidebar = () => {
  const { state, dispatch } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const { googleFile, setSlackChannels, selectedSlackChannels } =
    useFuzzieStore();
  const selectedNode = state.editor.selectedNode;
  const isNodeActive = selectedNode.data.configStatus === "active";
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [selectedEvent, setSelectedEvent] = useState<string>(
    selectedNode.data.metadata?.event || "",
  );

  useEffect(() => {
    if (isNodeActive) {
      setActiveTab("testing");
    } else {
      setActiveTab("configuration");
    }
    // Re-initialize event from metadata when node changes
    setSelectedEvent(selectedNode.data.metadata?.event || "");
  }, [selectedNode.id, isNodeActive]);

  // Track which node we've already fetched connections for
  const lastFetchedNodeId = React.useRef<string | null>(null);

  useEffect(() => {
    // Only fetch connections when the selected node actually changes
    if (selectedNode.id && selectedNode.id !== lastFetchedNodeId.current) {
      lastFetchedNodeId.current = selectedNode.id;
      onConnections(nodeConnection, state, googleFile);
    }
  }, [selectedNode.id]);

  useEffect(() => {
    if (nodeConnection.slackNode.slackAccessToken) {
      fetchBotSlackChannels(
        nodeConnection.slackNode.slackAccessToken,
        setSlackChannels,
      );
    }
  }, [nodeConnection, setSlackChannels]);

  if (!selectedNode.id) return null;

  const events = APP_EVENTS[selectedNode.data.type] || [];

  // Helper to render wizard in the sidebar container
  const renderWizardInSidebar = (WizardComponent: React.ComponentType) => (
    <aside className="flex flex-col h-full bg-background border-l border-l-muted/50 w-full overflow-hidden">
      <div className="p-6 pb-2 bg-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <EditorCanvasIconHelper type={selectedNode.data.type} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{selectedNode.data.title}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
              Step Detail • {selectedNode.id.slice(0, 8)}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {selectedNode.data.configStatus || "Draft"}
          </Badge>
        </div>
      </div>
      <Tabs defaultValue="settings" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 py-2 border-b bg-card">
          <TabsList className="w-full justify-start h-9 p-0.5 bg-muted/50">
            <TabsTrigger value="settings" className="flex-1 text-xs">
              Settings
            </TabsTrigger>
            <TabsTrigger value="json" className="flex-1 text-xs">
              JSON
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="settings"
          className="flex-1 overflow-auto m-0 p-0 animate-in fade-in"
        >
          <WizardComponent />
        </TabsContent>
        <TabsContent
          value="json"
          className="flex-1 overflow-auto m-0 p-4 animate-in fade-in"
        >
          <div className="rounded-md bg-muted p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
              {JSON.stringify(selectedNode.data, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );

  if (selectedNode.data.type === "Google Drive") {
    return renderWizardInSidebar(GoogleDriveWizard);
  }
  if (selectedNode.data.type === "Email") {
    return renderWizardInSidebar(GmailWizard);
  }
  if (selectedNode.data.type === "HTTP Request") {
    return renderWizardInSidebar(HttpRequestWizard);
  }
  if (selectedNode.data.type === "Webhook") {
    return renderWizardInSidebar(WebhookWizard);
  }
  if (selectedNode.data.type === "Wait") {
    return renderWizardInSidebar(WaitWizard);
  }
  if (selectedNode.data.type === "End") {
    return renderWizardInSidebar(EndWizard);
  }
  if (selectedNode.data.type === "Condition") {
    return renderWizardInSidebar(ConditionWizard);
  }
  if (selectedNode.data.type === "Data Transform") {
    return renderWizardInSidebar(DataTransformWizard);
  }
  if (selectedNode.data.type === "Key-Value Storage") {
    return renderWizardInSidebar(KVStorageWizard);
  }
  if (selectedNode.data.type === "Toast Message") {
    return renderWizardInSidebar(ToastWizard);
  }
  if (selectedNode.data.type === "Slack") {
    return renderWizardInSidebar(SlackWizard);
  }
  if (selectedNode.data.type === "Discord") {
    return renderWizardInSidebar(DiscordWizard);
  }
  if (selectedNode.data.type === "Notion") {
    return renderWizardInSidebar(NotionWizard);
  }
  if (selectedNode.data.type === "Trigger") {
    return renderWizardInSidebar(TriggerWizard);
  }

  return (
    <aside className="flex flex-col h-full bg-background border-l border-l-muted/50 w-full overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2 bg-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <EditorCanvasIconHelper type={selectedNode.data.type} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{selectedNode.data.title}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
              Step Detail • {selectedNode.id.slice(0, 8)}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {selectedNode.data.configStatus || "Draft"}
          </Badge>
        </div>
      </div>

      <Tabs
        key={selectedNode.id}
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-6 py-2 border-b bg-card">
          <TabsList className="bg-muted/50 w-full justify-start h-11 p-1">
            <TabsTrigger
              value="configuration"
              className="flex-1 data-[state=active]:bg-background flex items-center justify-center gap-2"
            >
              Configuration
              {isNodeActive && <Check className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="testing"
              className="flex-1 data-[state=active]:bg-background flex items-center justify-center gap-2"
            >
              Testing
              {isNodeActive && <Check className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger
              value="json"
              className="flex-1 data-[state=active]:bg-background flex items-center justify-center gap-2"
            >
              JSON
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <TabsContent
            value="configuration"
            className="m-0 p-6 space-y-8 animate-in fade-in slide-in-from-right-4"
          >
            {/* Event Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                1. Choose an Event
                {selectedEvent && <Check className="w-3 h-3 text-green-500" />}
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12 text-left font-normal bg-muted/20"
                  >
                    <span
                      className={clsx(
                        selectedEvent
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {selectedEvent
                        ? events.find((e) => e.value === selectedEvent)?.label
                        : "Select an event..."}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
                  <div className="space-y-1">
                    {events.map((event) => (
                      <div
                        key={event.value}
                        className={clsx(
                          "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                          selectedEvent === event.value && "bg-accent",
                        )}
                        onClick={() => setSelectedEvent(event.value)}
                      >
                        <span className="text-sm">{event.label}</span>
                        {selectedEvent === event.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-xs p-3 text-muted-foreground italic text-center">
                        No specialized events found for this app.
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Card className="border-primary/10 bg-primary/5">
                <CardContent className="p-4 flex gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedNode.data.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Account Connection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" />
                2. Connect Account
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y relative min-h-[100px]">
                {nodeConnection.isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-all animate-in fade-in">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <p className="text-[10px] text-muted-foreground animate-pulse font-medium">
                        Checking connection...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {CONNECTIONS.filter(
                      (connector) =>
                        connector.title === selectedNode.data.type ||
                        (selectedNode.data.type === "Email" &&
                          connector.title === "Google Drive"),
                    ).map((connection) => (
                      <RenderConnectionAccordion
                        key={connection.title}
                        state={state}
                        connection={connection}
                      />
                    ))}
                    {CONNECTIONS.every(
                      (c) => c.title !== selectedNode.data.type,
                    ) && (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        This app does not require a specialized account
                        connection.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            <div className="pt-4">
              <p className="text-[10px] text-muted-foreground text-center mb-4">
                Once configured, switch to the Testing tab to verify your setup.
              </p>
              <Button
                className="w-full h-11 shadow-lg bg-primary hover:bg-primary/90"
                onClick={() => {
                  const testingTab = document.querySelector(
                    '[value="testing"]',
                  ) as HTMLElement;
                  testingTab?.click();
                }}
              >
                Continue to Testing
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="testing"
            className="m-0 p-6 space-y-8 animate-in fade-in slide-in-from-right-4"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-primary" />
                  Configuration & Testing
                </label>

                <Accordion
                  type="single"
                  collapsible
                  className="w-full border rounded-xl bg-card/50 px-4"
                >
                  <AccordionItem value="output" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Eye className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            Map Output Fields
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Define how data flows from this app
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <RenderOutputAccordion
                        state={state}
                        nodeConnection={nodeConnection}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="p-8 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 z-10">
                    <p className="text-base font-bold">Verify Connection</p>
                    <p className="text-xs text-muted-foreground max-w-[240px]">
                      We'll execute this action once with your mapped data to
                      ensure everything is working perfectly.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="px-8 font-semibold shadow-sm hover:translate-y-[-1px] transition-transform"
                  >
                    Test Action
                  </Button>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-xl hover:shadow-green-500/20 transition-all"
                  onClick={() => {
                    let eventLabel =
                      events.find((e) => e.value === selectedEvent)?.label ||
                      "Configured";

                    // Add specific details for exactness
                    if (selectedNode.data.type === "Slack") {
                      const channelNames =
                        selectedSlackChannels
                          ?.map((c: any) => c.label)
                          .join(", ") || "";
                      if (channelNames) {
                        eventLabel += ` in ${channelNames}`;
                      }
                    } else if (selectedNode.data.type === "Discord") {
                      if (nodeConnection.discordNode.guildName) {
                        eventLabel += ` to ${nodeConnection.discordNode.guildName}`;
                      }
                    } else if (selectedNode.data.type === "Notion") {
                      if (nodeConnection.notionNode.workspaceName) {
                        eventLabel += ` in ${nodeConnection.notionNode.workspaceName}`;
                      }
                    }

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
                                    event: selectedEvent,
                                    eventLabel: eventLabel,
                                  },
                                },
                              }
                            : node,
                        ),
                      },
                    });
                    dispatch({
                      type: "SET_SIDEBAR_VISIBILITY",
                      payload: { open: false },
                    });
                    toast.success(
                      `${selectedNode.data.title} configured successfully!`,
                    );
                  }}
                >
                  Save & Finish Configuration
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    dispatch({
                      type: "SET_SIDEBAR_VISIBILITY",
                      payload: { open: false },
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="json"
            className="m-0 p-6 space-y-8 animate-in fade-in slide-in-from-right-4"
          >
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Raw Node Data
              </label>
              <div className="rounded-md bg-muted p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};

export default EditorCanvasSidebar;
