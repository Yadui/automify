import React from "react";
import Workflow from "./workflow";
import { onGetWorkflows } from "../_actions/workflow-connections";
import MoreCredits from "./more-credits";
// import MoreCredits from "./more-creadits";

// Define the type for a workflow
interface WorkflowType {
  id: string; // Existing property
  name: string; // Add required properties
  description: string; // Add required properties
  publish: boolean; // Add required properties
  // Add other properties as needed
}

// Remove unused props parameter if not needed
export default async function WorkflowsComponent() {
  const workflows = await onGetWorkflows();
  return (
    <div className="relative flex flex-col gap-4">
      <section className="flex flex-col m-2">
        <MoreCredits />
        {workflows?.length ? (
          workflows.map((flow: WorkflowType) => (
            <Workflow key={flow.id} {...flow} />
          ))
        ) : (
          <div className="mt-28 flex text-muted-foreground items-center justify-center">
            No Workflows
          </div>
        )}
      </section>
    </div>
  );
}
