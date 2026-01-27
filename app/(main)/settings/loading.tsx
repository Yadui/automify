import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Settings" description="Manage your account settings" />
      <div className="p-6 space-y-8">
        {/* Profile Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Settings Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-lg border space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
