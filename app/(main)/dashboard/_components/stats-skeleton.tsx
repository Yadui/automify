import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};
