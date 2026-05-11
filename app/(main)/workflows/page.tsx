import React from "react";
import WorkflowButton from "./_components/workflow-button";
import Workflows from "./_components";

// Remove unused props parameter if not needed
const WorkflowsPage = () => {
  // Remove unused props warning by using props or destructuring
  // const { someProp } = props; // Example if you have props to use

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Automation canvas</p>
          <h1 className="ds-page-title mt-3">Workflows</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Create, publish, and manage workflow automations from a dense, repeatable list surface.
          </p>
        </div>
        <WorkflowButton />
      </header>
      <Workflows />
    </div>
  );
};

export default WorkflowsPage;
