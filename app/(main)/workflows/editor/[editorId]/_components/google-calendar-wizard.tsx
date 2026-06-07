"use client";
import React, { useState, useEffect } from "react";
import { useEditor } from "@/providers/editor-provider";
import { CONNECTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Settings2,
  User2,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  CalendarSearch,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import RenderConnectionAccordion from "./render-connection-accordion";
import SmartInput from "./smart-input";
import { parseVariables } from "@/lib/utils";
import {
  listGoogleCalendars,
  testGoogleCalendarStep,
} from "../../../../connections/_actions/google-connection";

// ── Shared native-element style ───────────────────────────────────────────────
const nativeInputCls =
  "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-[#171717] " +
  "shadow-[rgb(235,235,235)_0px_0px_0px_1px] focus-visible:outline " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[hsla(212,100%,48%,1)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// ── 48 time slots: "00:00" … "23:30" (30-min increments) ─────────────────────
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const splitDT = (iso: string) => {
  if (!iso) return { date: "", time: "" };
  const t = iso.indexOf("T");
  if (t === -1) return { date: iso, time: "" };
  return { date: iso.slice(0, t), time: iso.slice(t + 1, t + 6) };
};

const combineDT = (date: string, time: string) =>
  date && time ? `${date}T${time}` : "";

// ── DateTimeField: date <input> + 30-min <select> ────────────────────────────
const DateTimeField = ({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) => {
  const { date, time } = splitDT(value);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <div className="grid grid-cols-[1fr_110px] gap-2">
        <input
          type="date"
          className={nativeInputCls}
          value={date}
          onChange={(e) => onChange(combineDT(e.target.value, time || "09:00"))}
        />
        <select
          className={nativeInputCls}
          value={time}
          onChange={(e) =>
            onChange(
              combineDT(
                date || new Date().toISOString().slice(0, 10),
                e.target.value
              )
            )
          }
        >
          <option value="" disabled>
            Time
          </option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

type Step = 1 | 2 | 3 | 4;

const CALENDAR_ACTIONS = [
  {
    id: "create_event" as const,
    label: "Create Event",
    description: "Create a new event in a Google Calendar.",
    Icon: CalendarPlus,
  },
  {
    id: "update_event" as const,
    label: "Update Event",
    description: "Update the details of an existing calendar event.",
    Icon: CalendarCheck,
  },
  {
    id: "delete_event" as const,
    label: "Delete Event",
    description: "Permanently delete a calendar event by its ID.",
    Icon: CalendarX,
  },
  {
    id: "get_event" as const,
    label: "Get Event",
    description: "Retrieve full details of a calendar event by its ID.",
    Icon: CalendarSearch,
  },
];

type CalendarActionId = (typeof CALENDAR_ACTIONS)[number]["id"];

type Config = {
  action: CalendarActionId;
  calendarId: string;
  eventId: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string;
  defaultReminders: boolean;
};

const DEFAULT_CONFIG: Config = {
  action: "create_event",
  calendarId: "",
  eventId: "",
  summary: "",
  description: "",
  startTime: "",
  endTime: "",
  attendees: "",
  defaultReminders: true,
};

export const GoogleCalendarWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;

  const _initStep = (): Step => {
    const meta = selectedNode?.data?.metadata as any;
    return (((selectedNode?.data as any)?.configStatus === "active" || meta?.sampleData) ? 4 : 1) as Step;
  };
  const [step, _setStep] = useState<Step>(_initStep);
  const [maxStep, setMaxStep] = useState<Step>(_initStep);
  const setStep = (next: Step) => { _setStep(next); setMaxStep((prev) => (next > prev ? next : prev) as Step); };
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(
    () => ((selectedNode?.data?.metadata as any)?.sampleData as Record<string, unknown> | null) ?? null
  );
  const [calendars, setCalendars] = useState<{ id: string; summary: string }[]>([]);
  const [calendarsLoading, setCalendarsLoading] = useState(false);

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Restore saved metadata on node change
  useEffect(() => {
    const meta = (selectedNode?.data?.metadata ?? {}) as any;
    const status = (selectedNode?.data as any)?.configStatus;
    setConfig((prev) => ({ ...prev, ...meta }));
    setTestResult((meta.sampleData as Record<string, unknown> | null) ?? null);
    const restored = ((status === "active" || meta.sampleData) ? 4 : 1) as Step;
    _setStep(restored);
    setMaxStep(restored);
  }, [selectedNode?.id]);

  // Fetch calendars when the user reaches the Configure step
  useEffect(() => {
    if (step !== 3 || calendars.length > 0) return;
    const fetchCalendars = async () => {
      setCalendarsLoading(true);
      try {
        const result = await listGoogleCalendars();
        if (result.calendars) setCalendars(result.calendars);
      } catch {
        // Silent — user can type a calendar ID manually
      }
      setCalendarsLoading(false);
    };
    fetchCalendars();
  }, [step, calendars.length]);

  const updateConfig = (key: keyof Config, value: unknown) => {
    const newConfig = { ...config, [key]: value } as Config;
    setConfig(newConfig);
    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  metadata: { ...node.data.metadata, [key]: value },
                },
              }
            : node
        ),
      },
    });
  };

  const selectedAction = CALENDAR_ACTIONS.find((a) => a.id === config.action)!;

  // Gate: can we advance to the Test step?
  const canProceedToTest = () => {
    if (config.action === "create_event") {
      return Boolean(config.summary && config.startTime && config.endTime);
    }
    return Boolean(config.eventId);
  };

  const onTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const parsedConfig = {
        ...config,
        summary: parseVariables(config.summary, state.editor.elements),
        description: parseVariables(config.description, state.editor.elements),
      };
      const result = await testGoogleCalendarStep(config.action, parsedConfig);
      if (result.success) {
        setTestResult(result.data ?? {});
        toast.success("Calendar action succeeded!");
      } else {
        toast.error(result.error ?? "Action failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
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
                    eventLabel: selectedAction.label,
                    sampleData: testResult,
                  },
                },
              }
            : node
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("Google Calendar node configured!");
  };

  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Action", icon: Settings2 },
    { id: 3, title: "Configure", icon: Calendar },
    { id: 4, title: "Test", icon: PlayCircle },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Progress bar ─────────────────────────────── */}
      <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0" />
          {steps.map((s) => (
            <div
              key={s.id}
              className={clsx(
                "relative z-10 flex flex-col items-center gap-2",
                s.id <= maxStep && s.id !== step && "cursor-pointer"
              )}
              onClick={() => { if (s.id <= maxStep && s.id !== step) setStep(s.id as Step); }}
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
        {/* ── Step 1 — Account ────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" />
                Connect Google Account
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "Google Calendar").map((connection) => (
                  <RenderConnectionAccordion
                    key={connection.title}
                    state={state}
                    connection={connection}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Connecting Google Calendar grants both Drive and Calendar access in one step.
                If you previously connected Google Drive only, click <strong>Connect</strong> above to re-authorise with Calendar permissions.
              </p>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── Step 2 — Action picker ───────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Select Action
              </label>
              <div className="grid gap-3">
                {CALENDAR_ACTIONS.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => updateConfig("action", action.id)}
                    className={clsx(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3",
                      config.action === action.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-card hover:border-primary/50"
                    )}
                  >
                    <action.Icon
                      className={clsx(
                        "w-5 h-5 mt-0.5 shrink-0",
                        config.action === action.id
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <div>
                      <p className="font-bold text-sm mb-1">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!config.action}
                onClick={() => setStep(3)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Configure ──────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Configure — {selectedAction.label}
            </label>

            {/* Calendar picker (all actions) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase">Calendar</Label>
              {calendarsLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading calendars…
                </div>
              ) : calendars.length > 0 ? (
                <select
                  className={nativeInputCls}
                  value={config.calendarId}
                  onChange={(e) => updateConfig("calendarId", e.target.value)}
                >
                  <option value="">Primary Calendar</option>
                  {calendars.map((cal) => (
                    <option key={cal.id} value={cal.id}>
                      {cal.summary}
                    </option>
                  ))}
                </select>
              ) : (
                <SmartInput
                  value={config.calendarId}
                  onChange={(v) => updateConfig("calendarId", v)}
                  placeholder="primary  (or paste a calendar ID)"
                />
              )}
            </div>

            {/* Event ID — update / delete / get */}
            {(config.action === "update_event" ||
              config.action === "delete_event" ||
              config.action === "get_event") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase">
                  Event ID <span className="text-red-500">*</span>
                </Label>
                <SmartInput
                  value={config.eventId}
                  onChange={(v) => updateConfig("eventId", v)}
                  placeholder="Paste Google Calendar event ID"
                />
              </div>
            )}

            {/* Title — create / update */}
            {(config.action === "create_event" || config.action === "update_event") && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase">
                    Title
                    {config.action === "create_event" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </Label>
                  <SmartInput
                    value={config.summary}
                    onChange={(v) => updateConfig("summary", v)}
                    placeholder="Team standup"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase">Description</Label>
                  <SmartInput
                    value={config.description}
                    onChange={(v) => updateConfig("description", v)}
                    type="textarea"
                    className="min-h-[80px]"
                    placeholder="Meeting agenda…"
                  />
                </div>

                <DateTimeField
                  label="Start time"
                  required={config.action === "create_event"}
                  value={config.startTime}
                  onChange={(v) => updateConfig("startTime", v)}
                />
                <DateTimeField
                  label="End time"
                  required={config.action === "create_event"}
                  value={config.endTime}
                  onChange={(v) => updateConfig("endTime", v)}
                />
              </>
            )}

            {/* Attendees & reminders — create only */}
            {config.action === "create_event" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase">Attendees</Label>
                  <SmartInput
                    value={config.attendees}
                    onChange={(v) => updateConfig("attendees", v)}
                    type="textarea"
                    className="min-h-[60px]"
                    placeholder="alice@example.com, bob@example.com"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Comma-separated email addresses.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Default reminders</p>
                    <p className="text-xs text-muted-foreground">
                      Use the calendar's default reminder settings.
                    </p>
                  </div>
                  <Switch
                    checked={config.defaultReminders}
                    onCheckedChange={(v) => updateConfig("defaultReminders", v)}
                  />
                </div>
              </>
            )}

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!canProceedToTest()}
                onClick={() => setStep(4)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4 — Test ───────────────────────────── */}
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
                <selectedAction.Icon className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold">
                {testResult ? "Action Succeeded!" : "Ready to Test"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                {testResult
                  ? `"${selectedAction.label}" completed successfully.`
                  : `Run a live test of "${selectedAction.label}" against your Google Calendar.`}
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
                Run Test
              </Button>
            )}

            {testResult && (
              <div className="text-left p-4 rounded-xl border bg-muted/30 space-y-2 text-xs max-h-48 overflow-y-auto">
                {Object.entries(testResult)
                  .filter(([, v]) => v !== null && v !== undefined && v !== "")
                  .slice(0, 8)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">{k}:</span>
                      <span className="font-medium text-right truncate max-w-[180px]">
                        {String(v)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
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

export default GoogleCalendarWizard;
