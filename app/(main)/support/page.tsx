import { LifeBuoy, Mail, MessageSquare, ShieldCheck } from "lucide-react";

const supportOptions = [
  {
    title: "Email Support",
    description: "Send account, billing, or OAuth setup questions to the Automify support inbox.",
    icon: Mail,
    detail: "support@automify.local",
  },
  {
    title: "Integration Help",
    description: "Get help with Google, Slack, Discord, Notion, GitHub, or Trello connection setup.",
    icon: MessageSquare,
    detail: "Connector setup",
  },
  {
    title: "Security Requests",
    description: "Request account deletion, integration revocation guidance, or data access support.",
    icon: ShieldCheck,
    detail: "Privacy and security",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Help desk</p>
          <h1 className="ds-page-title mt-3">Contact Support</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            Get help with accounts, OAuth configuration, connected apps, workflow behavior, and billing questions.
          </p>
        </div>
        <span className="ds-pill mt-1">
          <LifeBuoy className="h-3.5 w-3.5" /> Support
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {supportOptions.map((option) => (
          <article key={option.title} className="ds-card p-6">
            <option.icon className="h-6 w-6 text-[#171717]" strokeWidth={1.75} />
            <h2 className="ds-card-title mt-6">{option.title}</h2>
            <p className="mt-3 leading-6 text-[#4d4d4d]">{option.description}</p>
            <p className="mt-6 rounded-md bg-[#fafafa] px-3 py-2 text-sm font-medium text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
              {option.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="ds-card p-8">
        <p className="ds-eyebrow">Before sending</p>
        <h2 className="ds-card-title mt-4">Include the workflow or provider involved.</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[#4d4d4d]">
          For OAuth issues, include the provider, redirect URL, and error code. For workflow issues, include the workflow name, connected apps, and the action that failed.
        </p>
      </section>
    </div>
  );
}