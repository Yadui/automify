const WorkflowEditorLoading = () => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* ── Header toolbar ── */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-[#e5e5e5] bg-white px-4">
        <div className="h-5 w-5 animate-pulse rounded bg-[#e5e5e5]" />
        <div className="h-4 w-36 animate-pulse rounded bg-[#e5e5e5]" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-16 animate-pulse rounded bg-[#e5e5e5]" />
          <div className="h-8 w-20 animate-pulse rounded bg-[#e5e5e5]" />
        </div>
      </div>

      {/* ── Canvas + Sidebar ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Canvas (≈70%) */}
        <div className="relative flex-1 bg-[#fafafa]">
          {/* Fake nodes */}
          <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="h-16 w-52 animate-pulse rounded-lg border border-[#e5e5e5] bg-white shadow-sm" />
            <div className="h-6 w-0.5 animate-pulse bg-[#d4d4d4]" />
            <div className="h-16 w-52 animate-pulse rounded-lg border border-[#e5e5e5] bg-white shadow-sm" />
            <div className="h-6 w-0.5 animate-pulse bg-[#d4d4d4]" />
            <div className="h-16 w-52 animate-pulse rounded-lg border border-[#e5e5e5] bg-white shadow-sm" />
          </div>
          {/* Fake ReactFlow controls */}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            <div className="h-7 w-7 animate-pulse rounded bg-[#e5e5e5]" />
            <div className="h-7 w-7 animate-pulse rounded bg-[#e5e5e5]" />
            <div className="h-7 w-7 animate-pulse rounded bg-[#e5e5e5]" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px shrink-0 bg-[#e5e5e5]" />

        {/* Sidebar (≈30%, capped ~320 px) */}
        <aside className="w-80 shrink-0 overflow-hidden bg-white">
          {/* Node info card */}
          <div className="border-b border-[#e5e5e5] p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-[#e5e5e5]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-[#e5e5e5]" />
                <div className="h-3 w-full animate-pulse rounded bg-[#f0f0f0]" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="h-16 animate-pulse rounded-md bg-[#f5f5f5]" />
              <div className="h-16 animate-pulse rounded-md bg-[#f5f5f5]" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e5e5e5]">
            <div className="h-9 flex-1 animate-pulse bg-[#fafafa]" />
            <div className="h-9 flex-1 animate-pulse bg-white" />
          </div>

          {/* Tab content cards */}
          <div className="space-y-2 p-3">
            <div className="h-20 animate-pulse rounded-lg bg-[#f5f5f5]" />
            <div className="h-20 animate-pulse rounded-lg bg-[#f5f5f5]" />
            <div className="h-20 animate-pulse rounded-lg bg-[#f5f5f5]" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WorkflowEditorLoading;
