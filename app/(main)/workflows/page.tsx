import React, { Suspense } from "react";
import WorkflowButton from "./_components/workflow-button";
import Workflows from "./_components";
import { WorkflowsSkeleton } from "./_components/workflows-skeleton";
import WorkflowTemplates from "./_components/workflow-templates";

const WorkflowsPage = () => {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      {/* Page header */}
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Automation canvas</p>
          <h1 className="ds-page-title mt-3">Workflows</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Create, publish, and manage workflow automations from a dense,
            repeatable list surface.
          </p>
        </div>
        <WorkflowButton />
      </header>

      {/* Template quick-start grid */}
      <WorkflowTemplates />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[#ebebeb]" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[#808080]">
          Your workflows
        </span>
        <div className="h-px flex-1 bg-[#ebebeb]" />
      </div>

      {/* Workflow list — skeleton shows while DB query runs */}
      <Suspense fallback={<WorkflowsSkeleton />}>
        <Workflows />
      </Suspense>
    </div>
  );
};

export default WorkflowsPage;
