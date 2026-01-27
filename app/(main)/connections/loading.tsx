import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/page-header";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Connections"
        description="Manage your app connections"
      />
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex w-full items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
