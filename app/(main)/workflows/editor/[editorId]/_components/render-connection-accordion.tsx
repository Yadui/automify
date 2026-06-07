"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, PlugZap } from "lucide-react";
import Image from "next/image";
import { Connection } from "@/lib/types";
import { EditorState } from "@/providers/editor-provider";
import { getConnector, isConnectorType } from "@/lib/connectors";
import { useNodeConnections } from "@/providers/connection-provider";

type Props = {
  state: EditorState;
  connection: Connection;
};

const RenderConnectionAccordion = ({ state, connection }: Props) => {
  const { nodeConnection } = useNodeConnections();
  const { loadConnections, hasLoaded, isLoading, connectedTypes } =
    nodeConnection;
  const pathname = usePathname();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadConnections();
    }
  }, [hasLoaded, isLoading, loadConnections]);

  const title = connection.title;
  const connector = isConnectorType(title) ? getConnector(title) : null;
  const isConnected = connectedTypes.includes(title as never);

  const connectHref = (() => {
    const selectedNodeId = state.editor.selectedNode.id;
    const returnParams = new URLSearchParams({ tab: "configure" });
    if (selectedNodeId) returnParams.set("selectedNode", selectedNodeId);
    const returnTo = `${pathname}?${returnParams.toString()}`;

    if (connector?.oauth) {
      return `/api/auth/connect?${new URLSearchParams({
        type: title,
        returnTo,
      }).toString()}`;
    }
    return `/connections?${new URLSearchParams({
      manualConnector: title,
      returnTo,
    }).toString()}`;
  })();

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {connection.image ? (
          <Image
            src={connection.image}
            alt={title}
            width={28}
            height={28}
            className="object-contain"
          />
        ) : (
          <PlugZap className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {connection.description}
        </p>
      </div>

      {isLoading && !hasLoaded ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : isConnected ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Connected
        </span>
      ) : (
        <Link
          href={connectHref}
          onClick={() => setIsStarting(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          {isStarting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
          Connect
        </Link>
      )}
    </div>
  );
};

export default RenderConnectionAccordion;
