import Image from "next/image";
import {
  Calendar,
  CircuitBoard,
  Database,
  GitBranch,
  HardDrive,
  KanbanSquare,
  Mail,
  MousePointerClickIcon,
  Timer,
  Webhook,
  Zap,
} from "lucide-react";
import { Github, Slack } from "@/components/icons/brand-icons";
import type { ComponentType } from "react";
import type { EditorCanvasTypes } from "@/lib/types";
import { cn } from "@/lib/utils";

const connectorLogoImages: Partial<Record<EditorCanvasTypes, string>> = {
  Discord: "/discord.png",
  "Google Drive": "/googleDrive.png",
  Notion: "/notion.png",
  Slack: "/slack.png",
};

type ConnectorLogoProps = {
  type: EditorCanvasTypes;
  title?: string;
  size?: number;
  className?: string;
  imageClassName?: string;
};

const fallbackIcons: Record<EditorCanvasTypes, ComponentType<{ className?: string; size?: number }>> = {
  Action: Zap,
  AI: CircuitBoard,
  Condition: GitBranch,
  "Custom Webhook": Webhook,
  Discord: Zap,
  Email: Mail,
  GitHub: Github,
  Gmail: Mail,
  "Google Calendar": Calendar,
  "Google Drive": HardDrive,
  Notion: Database,
  Slack,
  Trello: KanbanSquare,
  Trigger: MousePointerClickIcon,
  Wait: Timer,
};

export const hasConnectorLogoImage = (type: EditorCanvasTypes) => Boolean(connectorLogoImages[type]);

const ConnectorLogo = ({
  type,
  title = type,
  size = 30,
  className,
  imageClassName,
}: ConnectorLogoProps) => {
  const logoImage = connectorLogoImages[type];

  if (logoImage) {
    return (
      <Image
        src={logoImage}
        alt={title}
        width={size}
        height={size}
        className={cn("flex-shrink-0 object-contain", imageClassName)}
      />
    );
  }

  const Icon = fallbackIcons[type] ?? Zap;
  return <Icon className={cn("flex-shrink-0", className)} size={size} />;
};

export default ConnectorLogo;