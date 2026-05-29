"use client";

import React from "react";
import { Info } from "lucide-react";
import { EditorCanvasTypes } from "@/lib/types";
import { GmailWizard } from "./core-primitives/gmail-wizard";
import { GoogleDriveWizard } from "./google-drive-wizard";
import { SlackWizard } from "./slack-wizard";
import { DiscordWizard } from "./discord-wizard";
import { NotionWizard } from "./notion-wizard";
import ConditionWizard from "./core-primitives/condition-wizard";
import WaitWizard from "./core-primitives/wait-wizard";
import HttpRequestWizard from "./core-primitives/http-request-wizard";
import WebhookWizard from "./core-primitives/webhook-wizard";
import ToastWizard from "./core-primitives/toast-wizard";
import EndWizard from "./core-primitives/end-wizard";
import TriggerWizard from "./core-primitives/trigger-wizard";
import DataTransformWizard from "./core-primitives/data-transform-wizard";
import KVStorageWizard from "./core-primitives/kv-storage-wizard";

type Props = {
  nodeType: EditorCanvasTypes | string;
};

const WIZARDS: Partial<Record<string, React.ComponentType>> = {
  // App connectors
  Email: GmailWizard,
  Gmail: GmailWizard,
  "Google Drive": GoogleDriveWizard,
  Slack: SlackWizard,
  Discord: DiscordWizard,
  Notion: NotionWizard,

  // Logic & utility
  Condition: ConditionWizard,
  Wait: WaitWizard,
  "HTTP Request": HttpRequestWizard,
  Webhook: WebhookWizard,
  "Custom Webhook": WebhookWizard,
  "Toast Message": ToastWizard,
  End: EndWizard,

  // Legacy node types kept renderable for older workflows
  Trigger: TriggerWizard,
  "Data Transform": DataTransformWizard,
  "Key-Value Storage": KVStorageWizard,
};

const NodeConfigRouter = ({ nodeType }: Props) => {
  const Wizard = WIZARDS[nodeType];

  if (!Wizard) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <Info className="h-5 w-5" />
        <p>No guided setup is available for this step yet.</p>
      </div>
    );
  }

  return <Wizard />;
};

export default NodeConfigRouter;
