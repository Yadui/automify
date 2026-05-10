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
  publish: boolean | null; // Update to allow null
  nodes?: string | null;
  // Add other properties as needed
}

{
  /* TODO: Make the icons accroding to the apps used in the workflow inside the app */
}
export default async function WorkflowsComponent() {
  const workflows = await onGetWorkflows();
  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-4">
        <MoreCredits />
        {workflows?.length ? (
          workflows.map((flow: WorkflowType) => (
            <Workflow key={flow.id} {...flow} />
          ))
        ) : (
          <div className="ds-card flex min-h-60 items-center justify-center p-8 text-center text-[#4d4d4d]">
            No workflows yet. Create one to start wiring apps together.
          </div>
        )}
      </section>
    </div>
  );
}
