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
import { toast } from "sonner";
import { Clock } from "lucide-react";
import SmartInput from "../smart-input";

const DelayWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [delayType, setDelayType] = useState(metadata.delayType || "duration");
  const [durationValue, setDurationValue] = useState(
    metadata.durationValue || "1"
  );
  const [durationUnit, setDurationUnit] = useState(
    metadata.durationUnit || "minutes"
  );
  const [targetDate, setTargetDate] = useState(metadata.targetDate || "");

  const handleSave = () => {
    let label = "";
    if (delayType === "duration") {
      label = `Wait for ${durationValue} ${durationUnit}`;
    } else {
      label = `Wait until ${targetDate}`;
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
                  delayType,
                  durationValue,
                  durationUnit,
                  targetDate,
                  eventLabel: label,
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("Delay configured");
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Delay Configuration</CardTitle>
          <CardDescription>
            Pause the workflow before proceeding to the next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Delay Type</Label>
            <Select value={delayType} onValueChange={setDelayType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="duration">
                  For a specific duration
                </SelectItem>
                <SelectItem value="timestamp">
                  Until a specific timestamp
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {delayType === "duration" ? (
            <div className="grid gap-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <SmartInput
                  value={durationValue}
                  onChange={setDurationValue}
                  placeholder="1"
                />
                <Select value={durationUnit} onValueChange={setDurationUnit}>
                  <SelectTrigger className="w-[120px]">
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
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Wait Until (ISO Date)</Label>
              <Input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Example: 2024-01-01T12:00:00Z (UTC will be assumed if no
                timezone specified)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {/* Delay doesn't need execution testing, just validation */}
        <Button
          onClick={handleSave}
          className="w-full"
          disabled={delayType === "timestamp" && !targetDate}
        >
          Save Configuration
        </Button>
      </div>

      <div className="p-4 bg-muted/20 rounded-lg flex items-start gap-4 text-sm text-muted-foreground">
        <Clock className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          The workflow will be paused at this step. No further actions will
          execute until the delay period is over.
        </p>
      </div>
    </div>
  );
};

export default DelayWizard;
