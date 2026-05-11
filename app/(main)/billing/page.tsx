import React from "react";
import BillingDashboard from "./_components/billing-dashboard";

const Billing = async () => {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Credits and plans</p>
          <h1 className="ds-page-title mt-3">Billing</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Review your tier, purchase more capacity, and keep workflow usage predictable.
          </p>
        </div>
      </header>
      <BillingDashboard />
    </div>
  );
};

export default Billing;
