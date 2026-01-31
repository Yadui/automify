import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const BillingSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Plan Overview Skeleton */}
      <div className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-xl space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      {/* Comparison Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="border border-border rounded-2xl overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex border-b border-border p-4 gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
