import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Billing" description="Manage your subscription" />
      <div className="p-6 space-y-8">
        {/* Current Plan Skeleton */}
        <div className="p-6 rounded-2xl border space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-full rounded-lg" />
        </div>

        {/* Plans Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl border space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-32" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
