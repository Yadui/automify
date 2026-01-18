import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface ConnectionCardProps {
  description: string;
  title: string;
  icon: string;
  type: string;
  connected: { [key: string]: boolean };
  connectedId?: string;
  returnUrl?: string; // Optional return URL for OAuth callback
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  description,
  title,
  icon,
  type,
  connected,
  connectedId,
  returnUrl,
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
      </CardHeader>
      <div className="flex flex-col items-center gap-2 p-4">
        {connected[type] ? (
          <>
            <div className="border-bg-primary rounded-lg border-2 px-3 py-2 font-bold text-white flex flex-col items-center">
              <span>Connected</span>
              {connectedId && (
                <span className="text-[10px] font-normal text-muted-foreground mt-1">
                  {connectedId}
                </span>
              )}
            </div>
            <Link
              href={getOAuthUrl(title)}
              className="rounded-lg bg-primary p-2 font-bold text-primary-foreground"
            >
              Refresh
            </Link>
          </>
        ) : (
          <Link
            href={getOAuthUrl(title)}
            className="rounded-lg bg-primary p-2 font-bold text-primary-foreground"
          >
            Connect
          </Link>
        )}
      </div>
    </Card>
  );
};

export default ConnectionCard;
