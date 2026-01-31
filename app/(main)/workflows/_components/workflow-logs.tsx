"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { onGetWorkflowLogs } from "../_actions/workflow-connections";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  workflowId: string;
};

const WorkflowLogs = ({ workflowId }: Props) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await onGetWorkflowLogs(workflowId);
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-10 w-10 p-0 border-input hover:bg-accent hover:text-accent-foreground"
          onClick={fetchLogs}
        >
          <History className="w-4 h-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background border-border">
        <div className="mx-auto w-full max-w-3xl overflow-auto max-h-[80vh] p-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-2xl font-bold">
              Run History
            </DrawerTitle>
            <DrawerDescription>
              Recent executions and their statuses
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-6 flex flex-col gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
                <div className="p-4 rounded-full bg-muted/40 mb-4">
                  <History className="w-8 h-8 text-muted-foreground opacity-30" />
                </div>
                <h4 className="font-semibold text-foreground">
                  No history yet
                </h4>
                <p className="text-sm text-muted-foreground max-w-[200px] mt-1">
                  Run this workflow to see execution logs and details here.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/50"
                >
                  <div className="mt-1">
                    {log.status === "Success" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          "font-semibold",
                          log.status === "Success"
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {log.status}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{log.message}</p>
                    {log.results && (
                      <div className="mt-3 p-3 rounded-lg bg-black/40 text-xs font-mono overflow-auto max-h-32">
                        <pre>{JSON.stringify(log.results, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WorkflowLogs;
