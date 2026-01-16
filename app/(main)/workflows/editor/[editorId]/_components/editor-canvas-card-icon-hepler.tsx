"use client";
import React from "react";
import Image from "next/image";
import {
  Calendar,
  CircuitBoard,
  Database,
  GitBranch,
  MousePointerClickIcon,
  Timer,
  Webhook,
  Zap,
  Globe,
  ArrowRightLeft,
  MessageSquare,
} from "lucide-react";
import { EditorCanvasTypes } from "@/lib/types";

type Props = { type: EditorCanvasTypes };

// App nodes that should use logo images
const APP_ICONS: Record<string, string> = {
  "Google Drive": "/googleDrive.png",
  Gmail: "/gmailLogo.png",
  Email: "/gmailLogo.png",
  Slack: "/slack.png",
  Discord: "/discord.png",
  Notion: "/notion.png",
  GitHub: "/github.png",
};

const EditorCanvasIconHelper = ({ type }: Props) => {
  // Check if this is an app node with a logo
  if (APP_ICONS[type]) {
    return (
      <Image
        src={APP_ICONS[type]}
        alt={type}
        width={30}
        height={30}
        className="flex-shrink-0 object-contain"
      />
    );
  }

  // Utility nodes use Lucide icons
  switch (type) {
    case "Condition":
      return <GitBranch className="flex-shrink-0" size={30} />;
    case "AI":
      return <CircuitBoard className="flex-shrink-0" size={30} />;
    case "Custom Webhook":
      return <Webhook className="flex-shrink-0" size={30} />;
    case "Google Calendar":
      return <Calendar className="flex-shrink-0" size={30} />;
    case "Trigger":
      return <MousePointerClickIcon className="flex-shrink-0" size={30} />;
    case "Action":
      return <Zap className="flex-shrink-0" size={30} />;
    case "Wait":
    case "Delay":
      return <Timer className="flex-shrink-0" size={30} />;
    case "HTTP Request":
      return <Globe className="flex-shrink-0" size={30} />;
    case "Webhook":
      return <Webhook className="flex-shrink-0" size={30} />;
    case "Data Transform":
      return <ArrowRightLeft className="flex-shrink-0" size={30} />;
    case "Key-Value Storage":
      return <Database className="flex-shrink-0" size={30} />;
    case "Toast Message":
      return <MessageSquare className="flex-shrink-0" size={30} />;
    default:
      return <Zap className="flex-shrink-0" size={30} />;
  }
};

export default EditorCanvasIconHelper;
