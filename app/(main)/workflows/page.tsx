import React from "react";
import WorkflowButton from "./_components/workflow-button";
import Workflows from "./_components";
import PageHeader from "@/components/page-header";
import WorkflowSearch from "./_components/workflow-search";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const WorkflowsPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;

  return (
    <div className="flex flex-col h-[90vh] w-[92vw]">
      <PageHeader
        title="Workflows"
        description="Create and manage your automated workflows"
      >
        <WorkflowButton />
      </PageHeader>
      <div className="flex-1 p-6 flex flex-col gap-6">
        <WorkflowSearch />
        <Workflows search={search} />
      </div>
    </div>
  );
};

export default WorkflowsPage;
