import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Define a specific type for props instead of using any
interface ConnectionCardProps {
  description: string;
  title: string;
  icon: string;
  type: string;
  connected: { [key: string]: boolean }; // Define the type for connected
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  description,
  title,
  icon,
  type,
  connected,
}) => {
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
            <div className="border-bg-primary rounded-lg border-2 px-3 py-2 font-bold text-white">
              Connected
            </div>
            <Link
              href={
                title === "Discord"
                  ? process.env.NEXT_PUBLIC_DISCORD_REDIRECT!
                  : title === "Notion"
                  ? process.env.NEXT_PUBLIC_NOTION_AUTH_URL!
                  : title === "Slack"
                  ? process.env.NEXT_PUBLIC_SLACK_REDIRECT!
                  : "#"
              }
              className="rounded-lg bg-primary p-2 font-bold text-primary-foreground"
            >
              Refresh
            </Link>
          </>
        ) : (
          <Link
            href={
              title === "Discord"
                ? process.env.NEXT_PUBLIC_DISCORD_REDIRECT!
                : title === "Notion"
                ? process.env.NEXT_PUBLIC_NOTION_AUTH_URL!
                : title === "Slack"
                ? process.env.NEXT_PUBLIC_SLACK_REDIRECT!
                : "#"
            }
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
