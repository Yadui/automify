import React from "react";
import Workflow from "./workflow";
import { onGetWorkflows } from "../_actions/workflow-connections";
// import MoreCredits from "./more-creadits";

type Props = {};

const Workflows = async (props: Props) => {
  const workflows = await onGetWorkflows();
  return (
    <div className="relative flex flex-col gap-4">
      <section className="flex flex-col m-2">
        {/* <MoreCredits /> */}
        {/* {workflows?.length ? (
          workflows.map((flow) => <Workflow key={flow.id} {...flow} />)
        ) : (
          <div className="mt-28 flex text-muted-foreground items-center justify-center">
            No Workflows
          </div>
        )} */}
        <Workflow
          description="creating a test workflow"
          id="we2r24314re3f3"
          name="automation workflow"
          publish={false}
        />
      </section>
    </div>
  );
};

export default Workflows;
