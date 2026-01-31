"use client";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConnectionCardProps {
  description: string;
  title: string;
  icon: string;
  type: string;
  connected: { [key: string]: boolean };
  connectedId?: string;
  returnUrl?: string;
  isConnecting?: boolean;
  isLocked?: boolean;
  onConnect?: () => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  description,
  title,
  icon,
  type,
  connected,
  connectedId,
  returnUrl,
  isConnecting = false,
  isLocked = false,
  onConnect,
}) => {
  // Helper to build OAuth URL with optional returnUrl
  const getOAuthUrl = (provider: string): string => {
    let base = "";
    switch (provider) {
      case "Discord":
        base = "/api/oauth/discord/start";
        break;
      case "Notion":
        base = "/api/oauth/notion/start";
        break;
      case "Slack":
        base = "/api/oauth/slack/start";
        break;
      case "Google Drive":
      case "Gmail":
        base = "/api/oauth/google/start";
        break;
      case "GitHub":
        base = "/api/auth/github/start";
        break;
      default:
        return "#";
    }
    if (returnUrl) {
      return `${base}?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
    return base;
  };

  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    }
    // Small delay to allow state update to render loader before navigation
    setTimeout(() => {
      window.location.href = getOAuthUrl(title);
    }, 100);
  };

  const handleDisconnect = async () => {
    const { disconnectConnection } =
      await import("../_actions/connection-actions");
    setIsDisconnecting(true);
    try {
      await disconnectConnection(title);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="flex w-full items-center justify-between">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <Image
            src={icon}
            alt={title}
            height={30}
            width={30}
            className="object-contain"
          />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {connected[type] && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full font-medium uppercase tracking-wide">
                Active
              </span>
              {connectedId && (
                <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                  {connectedId}
                </span>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <div className="flex flex-col items-end gap-2 p-4">
        {connected[type] ? (
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isLocked || isConnecting || isDisconnecting}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 font-semibold h-8 px-3 border border-border/50 justify-center w-full"
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Disconnect"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleConnect}
              disabled={isLocked || isConnecting || isDisconnecting}
              size="sm"
              className="font-bold h-8 px-3 text-muted-foreground hover:text-primary border border-border/50 justify-center w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isLocked || isConnecting}
            className="font-bold"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting
              </>
            ) : (
              "Connect"
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ConnectionCard;
