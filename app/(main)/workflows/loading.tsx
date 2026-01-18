import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Workflows"
        description="Manage your automation workflows"
      />
      <div className="relative flex flex-col gap-4 p-6">
        <section className="flex flex-col gap-4 m-2">
          {/* Skeleton workflow cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex w-full items-center justify-between gap-4 p-5 rounded-lg"
            >
              <div className="flex-1 flex items-center gap-4">
                {/* Node icons skeleton */}
                <div className="flex -space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
                {/* Title and description skeleton */}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              {/* Buttons skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
