import React from "react";
import { Activity, Cable, CreditCard, Workflow } from "lucide-react";

const metrics = [
  { label: "Connected apps", value: "8", description: "Available connector types" },
  { label: "Workflow stages", value: "3", description: "Develop, preview, ship" },
  { label: "Billing tiers", value: "3", description: "Hobby, Pro, Unlimited" },
];

const quickActions = [
  { title: "Create workflow", description: "Start a new automation from a clean canvas.", icon: Workflow },
  { title: "Connect apps", description: "Refresh OAuth access and connection settings.", icon: Cable },
  { title: "Review usage", description: "Track credits and subscription state.", icon: CreditCard },
];

const DashboardPage = () => {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Overview</p>
          <h1 className="ds-page-title mt-3">Dashboard</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Monitor your automation workspace, connection health, and billing posture from one restrained surface.
          </p>
        </div>
        <span className="ds-pill mt-1">
          <Activity className="h-3.5 w-3.5" /> Live workspace
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="ds-card p-6">
            <p className="ds-eyebrow">{metric.label}</p>
            <p className="mt-4 text-5xl font-semibold leading-none tracking-[-2.4px] text-[#171717]">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#4d4d4d]">{metric.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="ds-card p-8">
          <p className="ds-eyebrow">Pipeline</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.96px] text-[#171717]">
            Draft automation flow
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Develop", "#0a72ef", "Pick triggers and connector fields."],
              ["Preview", "#de1d8d", "Validate mappings before publish."],
              ["Ship", "#ff5b4f", "Run the workflow in production."],
            ].map(([stage, color, description]) => (
              <div key={stage} className="rounded-md bg-white p-4 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                <p className="font-mono text-xs font-medium uppercase leading-none" style={{ color }}>
                  {stage}
                </p>
                <p className="mt-4 text-sm leading-6 text-[#4d4d4d]">{description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="ds-card p-8">
          <p className="ds-eyebrow">Next steps</p>
          <div className="mt-6 flex flex-col gap-4">
            {quickActions.map((action) => (
              <div key={action.title} className="flex gap-4 rounded-md bg-white p-4 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                <action.icon className="mt-1 h-5 w-5 text-[#171717]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#171717]">{action.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#4d4d4d]">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
