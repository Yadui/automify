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
import { useEditor } from "@/providers/editor-provider";
import React, { useState } from "react";
import { toast } from "sonner";
import { StopCircle, AlertTriangle } from "lucide-react";

const EndWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const metadata = selectedNode.data.metadata || {};

  const [reason, setReason] = useState(metadata.reason || "");

  const handleSave = () => {
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
                  version: "1.0",
                  reason: reason || undefined,
                  eventLabel: reason ? `End: ${reason}` : "End Workflow",
                },
              },
            };
          }
          return node;
        }),
      },
    });
    toast.success("End node configured");
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <StopCircle className="h-5 w-5 text-red-500" />
            End / Stop
          </CardTitle>
          <CardDescription>
            Terminate workflow execution at this point.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason (Optional) */}
          <div className="grid gap-2">
            <Label>Reason (Optional)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Condition not met, Early exit"
            />
            <p className="text-xs text-muted-foreground">
              This label will appear in logs and run history.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-600">
          <p className="font-medium">No outgoing connections allowed</p>
          <p className="text-xs mt-1">
            This node terminates the workflow. Any nodes connected after this
            will not execute.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full">
        Save Configuration
      </Button>

      {/* Info */}
      <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Run status:</strong> Completed
        </p>
        <p>Use for condition false branches or early exits.</p>
      </div>
    </div>
  );
};

export default EndWizard;
