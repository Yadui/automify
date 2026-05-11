import type { Metadata } from "next";
import Navbar from "@/components/global/navbar";
import { Footer } from "@/components/global/footer";

export const metadata: Metadata = {
  title: "Terms of Service | Automify",
  description: "Automify terms for accounts, integrations, workflows, and billing.",
};

const sections = [
  {
    title: "Use Of Automify",
    body: "Automify provides tools for connecting applications and building workflow automations. You are responsible for the workflows you create, the services you connect, and the data you choose to process through those workflows.",
  },
  {
    title: "Accounts And Authentication",
    body: "You must provide accurate account information and keep your login credentials secure. If you authenticate with an OAuth provider, your use of that provider remains subject to its own terms and account policies.",
  },
  {
    title: "Connected Services",
    body: "By connecting a third-party service, you authorize Automify to use the permissions you approve for the workflows you configure. You can revoke access from the connected provider or disconnect the integration in Automify when available.",
  },
  {
    title: "Acceptable Use",
    body: "You may not use Automify to violate laws, infringe rights, abuse connected services, interfere with platform security, send unauthorized spam, or process data you do not have permission to use.",
  },
  {
    title: "Billing And Credits",
    body: "Some Automify features may depend on subscription plans, credits, or usage limits. Billing terms shown at purchase apply to paid plans, and access to paid functionality may change if payment fails or a subscription ends.",
  },
  {
    title: "Availability And Changes",
    body: "Automify may change, pause, or discontinue features as the product evolves. We aim to keep the service reliable, but connected apps, provider APIs, network conditions, or configuration issues may affect workflow execution.",
  },
  {
    title: "Disclaimers",
    body: "Automify is provided as-is to the fullest extent allowed by law. We are not responsible for third-party service outages, provider policy changes, or workflow results caused by incorrect configuration or revoked permissions.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <Navbar />
      <section className="mx-auto max-w-[900px] px-4 pb-20 pt-32 sm:px-8">
        <p className="ds-eyebrow">Legal</p>
        <h1 className="ds-display mt-4">Terms of Service</h1>
        <p className="mt-6 text-lg leading-8 text-[#4d4d4d]">
          Last updated: May 10, 2026. These terms describe the rules for using Automify accounts, integrations, workflows, and billing features.
        </p>
        <div className="mt-12 flex flex-col gap-4">
          {sections.map((section) => (
            <article key={section.title} className="ds-card p-6">
              <h2 className="ds-card-title">{section.title}</h2>
              <p className="mt-3 leading-7 text-[#4d4d4d]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}