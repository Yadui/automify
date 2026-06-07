import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shell skeleton shown while the (main) layout is resolving on initial load.
 * Mirrors the real app shell so the transition is seamless instead of a
 * blank full-screen spinner:
 *   - Left: sidebar column (w-20) with logo + nav icons + toggle
 *   - Right: infobar strip + page-content area
 */
export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden bg-white text-[#171717]">
      {/* ── Sidebar skeleton ──────────────────────────────── */}
      <div className="flex h-screen w-20 shrink-0 flex-col items-center justify-between px-4 py-6 shadow-[rgba(0,0,0,0.08)_1px_0px_0px_0px]">
        {/* Logo / home button */}
        <Skeleton className="h-10 w-10 rounded-full" />

        {/* Nav items */}
        <div className="flex flex-col items-center gap-8">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-md" />
          ))}
        </div>

        {/* Mode-toggle */}
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* ── Main content skeleton ─────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Infobar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#ebebeb] px-8">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Page body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
          {/* Page header */}
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Content rows */}
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
