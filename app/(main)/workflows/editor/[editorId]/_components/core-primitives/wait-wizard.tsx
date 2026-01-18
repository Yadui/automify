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
import { Badge } from "@/components/ui/badge";
import { useEditor } from "@/providers/editor-provider";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Clock, Calendar, Timer, AlertCircle } from "lucide-react";
import SmartInput from "../smart-input";

type WaitMode = "duration" | "until_time";

const WaitWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  // Migrate from old Delay node format if needed
  const initialMode: WaitMode =
    metadata.mode ||
    (metadata.delayType === "timestamp" ? "until_time" : "duration");

  const [mode, setMode] = useState<WaitMode>(initialMode);

  // Duration mode
  const [durationValue, setDurationValue] = useState(
    metadata.durationValue || metadata.value || "5"
  );
  const [durationUnit, setDurationUnit] = useState<string>(
    metadata.durationUnit || metadata.unit || "minutes"
  );

  // Until time mode
  const [targetDateTime, setTargetDateTime] = useState(
    metadata.targetDateTime || metadata.datetime || ""
  );
  const [timezone, setTimezone] = useState(
    metadata.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Generate human-readable summary
  const summary = useMemo(() => {
    if (mode === "duration") {
      const val = durationValue || "?";
      const unit = durationUnit || "minutes";
      return `Wait for ${val} ${unit}`;
    } else {
      if (!targetDateTime) return "Wait until a specific time";
      try {
        const date = new Date(targetDateTime);
        return `Wait until ${date.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`;
      } catch {
        return "Wait until a specific time";
      }
    }
  }, [mode, durationValue, durationUnit, targetDateTime]);

  const handleSave = () => {
    // Validation
    if (mode === "duration" && (!durationValue || Number(durationValue) <= 0)) {
      toast.error("Please enter a valid duration");
      return;
    }
    if (mode === "until_time" && !targetDateTime) {
      toast.error("Please select a target date and time");
      return;
    }

    // Build config based on mode
    const config =
      mode === "duration"
        ? {
            type: "duration" as const,
            value: Number(durationValue),
            unit: durationUnit,
          }
        : {
            type: "until_time" as const,
            datetime: new Date(targetDateTime).toISOString(),
            timezone,
          };

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
                  version: "2.0",
                  mode,
                  // Duration fields
                  durationValue:
                    mode === "duration" ? durationValue : undefined,
                  durationUnit: mode === "duration" ? durationUnit : undefined,
                  // Until time fields
                  targetDateTime:
                    mode === "until_time" ? targetDateTime : undefined,
                  timezone: mode === "until_time" ? timezone : undefined,
                  // Full config for execution
                  config,
                  eventLabel: summary,
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Wait configured");
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Wait
          </CardTitle>
          <CardDescription>
            Pause workflow execution before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="grid gap-2">
            <Label>Wait Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as WaitMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="duration">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    For a duration
                  </div>
                </SelectItem>
                <SelectItem value="until_time">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Until date & time
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration Mode Fields */}
          {mode === "duration" && (
            <div className="grid gap-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <SmartInput
                  value={durationValue}
                  onChange={setDurationValue}
                  placeholder="5"
                  className="w-24"
                />
                <Select value={durationUnit} onValueChange={setDurationUnit}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Max wait: 7 days. Supports dynamic values like{" "}
                {"{{previousNode.delay}}"}
              </p>
            </div>
          )}

          {/* Until Time Mode Fields */}
          {mode === "until_time" && (
            <>
              <div className="grid gap-2">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={targetDateTime}
                  onChange={(e) => setTargetDateTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">
                      Asia/Kolkata (IST)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York (EST)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      America/Los_Angeles (PST)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      Europe/London (GMT)
                    </SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  If the target time is in the past, execution continues
                  immediately. Max wait: 365 days.
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-sm font-medium text-primary">{summary}</p>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full">
        Save Configuration
      </Button>

      {/* Info */}
      <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Output:</strong> startedAt, resumedAt, waitDuration
        </p>
        <p>Workflow state is persisted safely during wait.</p>
      </div>
    </div>
  );
};

export default WaitWizard;
