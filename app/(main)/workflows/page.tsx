import React from "react";
import WorkflowButton from "./_components/workflow-button";
import Workflows from "./_components";
import PageHeader from "@/components/page-header";

const WorkflowsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Workflows"
        description="Create and manage your automated workflows"
      >
        <WorkflowButton />
      </PageHeader>
      <div className="flex-1 p-6">
        <Workflows />
      </div>
    </div>
  );
};

export default WorkflowsPage;
