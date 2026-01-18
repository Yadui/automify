import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Editor Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Editor Canvas Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative bg-muted/20 flex items-center justify-center">
          {/* Fake canvas grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Loading indicator in center */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading workflow...
            </p>
          </div>

          {/* Skeleton nodes scattered on canvas */}
          <div className="absolute top-1/4 left-1/4">
            <Skeleton className="w-48 h-24 rounded-xl" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="w-48 h-24 rounded-xl" />
          </div>
          <div className="absolute bottom-1/4 right-1/4">
            <Skeleton className="w-48 h-24 rounded-xl" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-80 border-l bg-background p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
