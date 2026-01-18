import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Dashboard"
        description="Overview of your automation platform"
      />
      <div className="relative flex-1 p-6 sm:p-8 space-y-12">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
