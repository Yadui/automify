import type { Metadata } from "next";
import Navbar from "@/components/global/navbar";
import { Footer } from "@/components/global/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Automify",
  description: "Automify privacy policy for account, OAuth, and workflow data.",
};

const sections = [
  {
    title: "Information We Collect",
    body: "Automify collects account information such as your name, email address, profile image, and sign-in provider identifier. When you connect third-party services, Automify stores the connection details needed to run workflows, such as OAuth tokens, workspace identifiers, channel identifiers, and selected configuration fields.",
  },
  {
    title: "How We Use Information",
    body: "We use account and connection information to authenticate you, display your workspace, connect approved services, run automations you configure, track billing or usage state, and improve reliability of the product experience.",
  },
  {
    title: "Google OAuth Data",
    body: "If you sign in with Google or connect Google services, Automify uses the granted OAuth permissions only to authenticate your account or perform the specific Google Drive, Gmail, or Google Calendar actions you enable. Automify does not sell Google user data or use it for advertising.",
  },
  {
    title: "Sharing And Disclosure",
    body: "Automify does not sell personal data. Data may be shared with infrastructure providers, payment processors, authentication providers, or connected services only as needed to provide the application, comply with law, prevent abuse, or protect the service.",
  },
  {
    title: "Security And Retention",
    body: "Automify uses reasonable technical safeguards for application data and stores authentication cookies as HTTP-only sessions. We retain account, workflow, and connection data while your account is active or as needed to provide the service and meet legal or operational requirements.",
  },
  {
    title: "Your Choices",
    body: "You can disconnect integrations, stop using workflows, or request deletion of your account data through the support contact configured for Automify. Revoking access in a provider dashboard may stop related workflows from running.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <Navbar />
      <section className="mx-auto max-w-[900px] px-4 pb-20 pt-32 sm:px-8">
        <p className="ds-eyebrow">Legal</p>
        <h1 className="ds-display mt-4">Privacy Policy</h1>
        <p className="mt-6 text-lg leading-8 text-[#4d4d4d]">
          Last updated: May 10, 2026. This policy explains how Automify handles account, OAuth, connection, and workflow data.
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