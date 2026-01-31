import React from "react";
import Workflow from "./workflow";
import { onGetWorkflows } from "../_actions/workflow-connections";
import MoreCredits from "./more-credits";
import { Workflow as WorkflowIcon } from "lucide-react";
import WorkflowButton from "./workflow-button";

// Define the type for a workflow
interface WorkflowType {
  id: string;
  name: string;
  description: string;
  publish: boolean | null;
  nodes: any;
  edges: any;
}

// Remove unused props parameter if not needed
export default async function WorkflowsComponent({
  search,
}: {
  search?: string;
}) {
  const workflows = await onGetWorkflows();

  const filteredWorkflows = search
    ? workflows?.filter((flow) =>
        flow.name.toLowerCase().includes(search.toLowerCase()),
      )
    : workflows;

  return (
    <div className="relative flex flex-col gap-4">
      <section className="flex flex-col gap-6">
        <MoreCredits />
        {filteredWorkflows?.length ? (
          filteredWorkflows.map((flow: WorkflowType) => (
            <Workflow key={flow.id} {...flow} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-card/30 rounded-3xl border border-dashed border-muted-foreground/20 mt-4">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <WorkflowIcon className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {search ? "No matches found" : "Ready to automate?"}
            </h3>
            <p className="text-muted-foreground max-w-xs mb-8">
              {search
                ? `We couldn't find any workflows matching "${search}". Try a different search term.`
                : "Unlock the power of automation. Create your first workflow to see the magic happen!"}
            </p>
            {!search && <WorkflowButton />}
          </div>
        )}
      </section>
    </div>
  );
}
