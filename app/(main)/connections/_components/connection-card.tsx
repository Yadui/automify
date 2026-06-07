// app/(main)/connections/_components/connection-card.tsx
import React from "react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getConnector, type ConnectorType } from "@/lib/connectors";
import ConnectorLogo from "@/components/global/connector-logo";

interface ConnectionCardProps {
  description: string;
  title: string;
  type: ConnectorType;
  connected: { [key: string]: boolean };
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  description,
  title,
  type,
  connected,
}) => {
  const connector = getConnector(type);
  // PAT connectors (no oauth block) go to the manual connection form;
  // OAuth connectors go through the OAuth redirect handler.
  const authUrl = connector.oauth
    ? `/api/auth/connect?${new URLSearchParams({ type, returnTo: "/connections" }).toString()}`
    : `/connections?${new URLSearchParams({ manualConnector: type, returnTo: "/connections" }).toString()}`;

  return (
    <Card className="flex w-full flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
      <CardHeader className="flex flex-row items-center gap-4 p-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
          <ConnectorLogo type={type} title={title} size={28} />
        </div>
        <div>
          <CardTitle className="text-lg tracking-[-0.32px]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        {connected[type] ? (
          <div className="flex items-center gap-2">
            <div className="ds-pill">
              Connected
            </div>
            <Link
              href={authUrl}
              className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:bg-[#fafafa]"
            >
              Reconnect
            </Link>
          </div>
        ) : (
          <Link
            href={authUrl}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#171717] px-4 text-sm font-medium text-white shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px] transition-colors hover:bg-black"
          >
            Connect
          </Link>
        )}
      </div>
    </Card>
  );
};

export default ConnectionCard;
