"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import ConnectorLogo from "@/components/global/connector-logo";
import type { EditorCanvasTypes } from "@/lib/types";
import { onCreateFromTemplate } from "../_actions/workflow-connections";

type Template = {
  id: string;
  name: string;
  description: string;
  connectors: EditorCanvasTypes[];
  category: string;
};

// Static data — mirrors getWorkflowTemplates in the action file.
// Kept here so the component renders with zero loading state on first paint.
const TEMPLATES: Template[] = [
  {
    id: "email-notification",
    name: "Email Notification",
    description: "Trigger a custom email when an event fires.",
    connectors: ["Trigger", "Email"],
    category: "Notification",
  },
  {
    id: "slack-notification",
    name: "Slack Alert",
    description: "Post a message to Slack when your workflow runs.",
    connectors: ["Trigger", "Slack"],
    category: "Notification",
  },
  {
    id: "drive-sync",
    name: "Drive → Discord",
    description: "Watch Google Drive for changes and post a Discord alert.",
    connectors: ["Google Drive", "Discord"],
    category: "Sync",
  },
  {
    id: "api-integration",
    name: "API Integration",
    description: "Call an external API and branch on the response.",
    connectors: ["Custom Webhook", "Condition"],
    category: "Developer",
  },
  {
    id: "github-to-notion",
    name: "GitHub → Notion",
    description: "Log new GitHub issues directly into a Notion database.",
    connectors: ["GitHub", "Notion"],
    category: "Productivity",
  },
  {
    id: "conditional-notify",
    name: "Conditional Route",
    description: "Evaluate a condition and route to Slack or email.",
    connectors: ["Condition", "Slack", "Email"],
    category: "Logic",
  },
];

export default function WorkflowTemplates() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUseTemplate = async (templateId: string) => {
    if (loadingId) return;
    setLoadingId(templateId);

    try {
      const result = await onCreateFromTemplate(templateId);

      if (result.success) {
        toast.success("Workflow created — opening editor.");
        router.push(`/workflows/editor/${result.workflowId}`);
      } else {
        toast.error(result.error ?? "Failed to create workflow");
        setLoadingId(null);
      }
    } catch {
      toast.error("Unable to create workflow from template");
      setLoadingId(null);
    }
  };

  return (
    <section>
      {/* Section header */}
      <div className="mb-5">
        <p className="ds-eyebrow">Templates</p>
        <h2 className="mt-2 text-lg font-semibold tracking-[-0.36px] text-[#171717]">
          Start from a pattern
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#4d4d4d]">
          Pick a pre-wired template and open it straight in the editor.
        </p>
      </div>

      {/* Template grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => {
          const isLoading = loadingId === template.id;
          const isDisabled = loadingId !== null;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleUseTemplate(template.id)}
              disabled={isDisabled}
              className="ds-card group flex flex-col gap-4 p-5 text-left transition-shadow hover:shadow-[rgba(0,0,0,0.10)_0px_0px_0px_1px,rgba(0,0,0,0.06)_0px_4px_16px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Connector icon row */}
              <div className="flex items-center gap-1.5">
                {template.connectors.slice(0, 4).map((type) => (
                  <span
                    key={type}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px]"
                  >
                    <ConnectorLogo type={type} size={18} />
                  </span>
                ))}
                {template.connectors.length > 4 && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#fafafa] shadow-[rgb(235,235,235)_0px_0px_0px_1px] text-[10px] font-medium text-[#666666]">
                    +{template.connectors.length - 4}
                  </span>
                )}
              </div>

              {/* Name + description */}
              <div className="flex-1">
                <p className="text-sm font-semibold leading-5 text-[#171717]">
                  {template.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666666]">
                  {template.description}
                </p>
              </div>

              {/* Footer: category tag + arrow/spinner */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full border border-[#ebebeb] bg-[#fafafa] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-[#808080]">
                  {template.category}
                </span>
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#666666]" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5 text-[#d4d4d4] transition-colors group-hover:text-[#171717]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
