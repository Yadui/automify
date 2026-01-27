import React from "react";
import Workflow from "./workflow";
import { onGetWorkflows } from "../_actions/workflow-connections";
import MoreCredits from "./more-credits";
// import MoreCredits from "./more-creadits";

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
          <div className="mt-28 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <p>No Workflows found</p>
            {search && <p className="text-sm italic">for "{search}"</p>}
          </div>
        )}
      </section>
    </div>
  );
}
