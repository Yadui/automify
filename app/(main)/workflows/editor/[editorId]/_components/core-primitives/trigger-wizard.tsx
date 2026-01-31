"use client";
import React, { useState } from "react";
import { useEditor } from "@/providers/editor-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Info, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

const TriggerWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;
  const [triggerType, setTriggerType] = useState<string>(
    selectedNode.data.metadata?.triggerType || "manual",
  );

  const triggerOptions = [
    {
      id: "manual",
      label: "Manual Trigger",
      description: "Run workflow manually from the dashboard or API.",
      icon: MousePointerClick,
    },
  ];

  const handleSave = () => {
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
                    triggerType,
                    eventLabel:
                      triggerOptions.find((t) => t.id === triggerType)?.label ||
                      "Manual Trigger",
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
    toast.success("Trigger configured successfully!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-semibold flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-primary" />
          Select Trigger Type
        </label>

        <div className="space-y-3">
          {triggerOptions.map((option) => (
            <Card
              key={option.id}
              onClick={() => setTriggerType(option.id)}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                triggerType === option.id
                  ? "border-primary bg-primary/5"
                  : "bg-card/50"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <option.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{option.label}</span>
                    {triggerType === option.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Trigger node is the starting point of your workflow. It
              determines when and how your automation begins.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 space-y-3">
        <Button
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
          onClick={handleSave}
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
  );
};

export default TriggerWizard;
