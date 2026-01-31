import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ConnectionsSkeleton = () => {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-xl h-28 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
};
