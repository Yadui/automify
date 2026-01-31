import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const WorkflowsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-xl h-40 flex items-center justify-between"
        >
          <div className="flex flex-col gap-4 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-12 w-2/3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
