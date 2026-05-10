import React from "react";

const page = () => {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Starting points</p>
          <h1 className="ds-page-title mt-3">Templates</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Reusable workflow templates will live here as the automation library grows.
          </p>
        </div>
      </header>
      <div className="ds-card flex min-h-64 items-center justify-center p-8 text-center text-[#4d4d4d]">
        No templates published yet.
      </div>
    </div>
  );
};

export default page;
