import { BackgroundLines } from "@/components/ui/background-lines";
import React from "react";

const DashboardPage = () => {
  return (
    <>
      <div className="sticky top-10 z-[10] pt-10 flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg">
        <p>Dashboard</p>
      </div>
      <BackgroundLines className="z-1">
        {
          <div className="text-4xl flex items-center justify-center pt-96 z-[1]">
            <p>Create automations here.</p>
          </div>
        }
      </BackgroundLines>
    </>
  );
};

export default DashboardPage;
