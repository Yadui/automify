import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SettingsSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Tabs List Skeleton */}
      <div className="flex gap-4 max-w-md">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>

      <div className="max-w-2xl space-y-8 mt-8">
        {/* Profile Section Skeleton */}
        <div className="space-y-6">
          <div className="border-b border-border pb-4 space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="flex items-center gap-6 p-4 rounded-3xl border border-border bg-card/50">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
