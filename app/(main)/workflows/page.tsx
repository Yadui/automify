import React from "react";
import WorkflowButton from "./_components/workflow-button";
import Workflows from "./_components";

// Remove unused props parameter if not needed
const WorkflowsPage = () => {
  // Remove unused props warning by using props or destructuring
  // const { someProp } = props; // Example if you have props to use

  return (
    <div className="flex flex-col relative top-20">
      <h1 className="text-4xl sticky  z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b justify-between">
        Workflows
        <WorkflowButton />
      </h1>
      <Workflows />
    </div>
  );
};

export default WorkflowsPage;
