const WorkflowEditorLoading = () => {
  return (
    <div className="grid h-[calc(100vh-96px)] grid-cols-[minmax(0,1fr)_320px] overflow-hidden border border-[#e5e5e5] bg-white">
      <div className="relative bg-[#fafafa]">
        <div className="absolute left-4 top-4 h-8 w-24 animate-pulse rounded bg-[#e5e5e5]" />
        <div className="absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded bg-[#e5e5e5]" />
      </div>
      <aside className="border-l border-[#e5e5e5] p-4">
        <div className="h-8 w-40 animate-pulse rounded bg-[#e5e5e5]" />
        <div className="mt-6 space-y-3">
          <div className="h-20 animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-20 animate-pulse rounded bg-[#f0f0f0]" />
          <div className="h-20 animate-pulse rounded bg-[#f0f0f0]" />
        </div>
      </aside>
    </div>
  );
};

export default WorkflowEditorLoading;