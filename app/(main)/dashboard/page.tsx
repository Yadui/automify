import { BackgroundLines } from "@/components/ui/background-lines";
import React from "react";

const DashboardPage = () => {
  return (
    <>
      <div className="relative z-5 w-auto max-h-screen pb-2 border-b text-4xl ">
        <p>Dashboard</p>
      </div>
      {/* TODO: create sample templates for users */}
      <BackgroundLines className="relative z-1 overflow-hidden">
        {
          <div className="text-4xl flex items-center justify-center text-center">
            <p>Create automations here.</p>
          </div>
        }
      </BackgroundLines>
    </>
  );
};

export default DashboardPage;
