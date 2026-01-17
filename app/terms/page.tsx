import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackToTop from "@/components/back-to-top";

export const metadata: Metadata = {
  title: "Terms of Service | Automify",
  description:
    "Terms of Service for Automify - Read our terms and conditions for using the platform.",
};

const tocItems = [
  { id: "company", label: "1. Company Information" },
  { id: "acceptance", label: "2. Acceptance of Terms" },
  { id: "eligibility", label: "3. Eligibility" },
  { id: "account", label: "4. Account Registration" },
  { id: "service", label: "5. Service Description" },
  { id: "integrations", label: "6. Third-Party Integrations" },
  { id: "acceptable-use", label: "7. Acceptable Use" },
  { id: "user-content", label: "8. User Content" },
  { id: "intellectual-property", label: "9. Intellectual Property" },
  { id: "subscription", label: "10. Subscription & Payments" },
  { id: "availability", label: "11. Service Availability" },
  { id: "disclaimers", label: "12. Disclaimers" },
  { id: "liability", label: "13. Limitation of Liability" },
  { id: "indemnification", label: "14. Indemnification" },
  { id: "termination", label: "15. Termination" },
  { id: "dispute", label: "16. Dispute Resolution" },
  { id: "force-majeure", label: "17. Force Majeure" },
  { id: "export", label: "18. Export Control & Sanctions" },
  { id: "general", label: "19. General Provisions" },
  { id: "changes", label: "20. Changes to Terms" },
  { id: "contact", label: "21. Contact Information" },
];

export default function TermsOfService() {
  const lastUpdated = "January 17, 2026";
  const effectiveDate = "January 17, 2026";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex gap-12">
          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>

            <div className="prose prose-invert max-w-none space-y-8">
              {/* Company Information */}
              <section id="company">
                <h2 className="text-2xl font-semibold mb-4">
                  1. Company Information &amp; Legal Entity
                </h2>
                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <p className="text-muted-foreground mb-2">
                    <strong>Service Provider:</strong> Automify
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Legal Entity:</strong> [Legal Entity Name]
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Country of Incorporation:</strong> [Country]
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Registered Address:</strong> [Business Address]
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">
                  Automify operates this workflow automation platform and is
                  responsible for providing the Service as described in these
                  Terms.
                </p>
              </section>

              {/* Acceptance */}
              <section id="acceptance">
                <h2 className="text-2xl font-semibold mb-4">
                  2. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service constitute a legally binding agreement
                  between you and Automify governing your access to and use of
                  the Automify platform, including our website, applications,
                  APIs, and related services (collectively, the
                  &quot;Service&quot;).
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By creating an account or using our Service, you acknowledge
                  that you have read, understood, and agree to be bound by these
                  Terms and our Privacy Policy.
                </p>
              </section>

              {/* Eligibility */}
              <section id="eligibility">
                <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
                <p className="text-muted-foreground mb-4">
                  To use Automify, you must:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Be at least 16 years of age</li>
                  <li>
                    Have the legal capacity to enter into a binding agreement
                  </li>
                  <li>
                    Not be prohibited from using the Service under applicable
                    laws
                  </li>
                  <li>
                    Provide accurate and complete registration information
                  </li>
                </ul>
              </section>

              {/* Account */}
              <section id="account">
                <h2 className="text-2xl font-semibold mb-4">
                  4. Account Registration & Security
                </h2>
                <p className="text-muted-foreground mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Maintaining the confidentiality of your login credentials
                  </li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Using strong, unique passwords</li>
                </ul>
              </section>

              {/* Service Description */}
              <section id="service">
                <h2 className="text-2xl font-semibold mb-4">
                  5. Service Description
                </h2>
                <p className="text-muted-foreground mb-4">
                  Automify is a workflow automation platform that allows you to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Create automated workflows connecting various services
                  </li>
                  <li>
                    Set up triggers based on events (file changes, webhooks,
                    schedules)
                  </li>
                  <li>Execute actions across integrated services</li>
                  <li>
                    Connect third-party services via OAuth (Google, Discord,
                    Notion, Slack)
                  </li>
                </ul>
              </section>

              {/* Integrations */}
              <section id="integrations">
                <h2 className="text-2xl font-semibold mb-4">
                  6. Third-Party Integrations
                </h2>
                <p className="text-muted-foreground mb-4">
                  When you connect third-party services, you authorize us to
                  access and interact with those services on your behalf. Your
                  use of third-party services is also subject to those
                  services&apos; respective terms and privacy policies.
                </p>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Supported:</strong> Google (Gmail, Drive), Discord,
                    Notion, Slack, GitHub
                  </p>
                </div>
              </section>

              {/* Acceptable Use */}
              <section id="acceptable-use">
                <h2 className="text-2xl font-semibold mb-4">
                  7. Acceptable Use Policy
                </h2>
                <p className="text-muted-foreground mb-4">You agree NOT to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Use the Service for any illegal or unauthorized purpose
                  </li>
                  <li>
                    Send spam, unsolicited messages, or bulk communications
                  </li>
                  <li>Transmit malware, viruses, or other harmful code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>
                    Reverse engineer or disassemble any part of the Service
                  </li>
                  <li>Use the Service to harass or harm others</li>
                  <li>Exceed rate limits or abuse API endpoints</li>
                </ul>
              </section>

              {/* User Content */}
              <section id="user-content">
                <h2 className="text-2xl font-semibold mb-4">
                  8. User Content & Workflows
                </h2>
                <p className="text-muted-foreground mb-4">
                  You retain ownership of all content and workflows you create.
                  By using the Service, you grant us a limited license to access
                  and store your content solely to provide the Service.
                </p>
                <p className="text-muted-foreground">
                  You are solely responsible for your User Content and
                  workflows.
                </p>
              </section>

              {/* Intellectual Property */}
              <section id="intellectual-property">
                <h2 className="text-2xl font-semibold mb-4">
                  9. Intellectual Property
                </h2>
                <p className="text-muted-foreground">
                  The Service, including its original content, features, and
                  functionality, is owned by Automify and is protected by
                  international copyright, trademark, and other intellectual
                  property laws.
                </p>
              </section>

              {/* Subscription */}
              <section id="subscription">
                <h2 className="text-2xl font-semibold mb-4">
                  10. Subscription & Payments
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Automify offers a free tier with limited features</li>
                  <li>Premium features require a paid subscription</li>
                  <li>
                    Subscriptions are billed in advance (monthly or annual)
                  </li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>You may cancel your subscription at any time</li>
                </ul>
              </section>

              {/* Availability */}
              <section id="availability">
                <h2 className="text-2xl font-semibold mb-4">
                  11. Service Availability
                </h2>
                <p className="text-muted-foreground">
                  We strive to maintain high availability but do not guarantee
                  uninterrupted access. We reserve the right to modify, suspend,
                  or discontinue any part of the Service with reasonable notice.
                </p>
              </section>

              {/* Disclaimers */}
              <section id="disclaimers">
                <h2 className="text-2xl font-semibold mb-4">12. Disclaimers</h2>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                    AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT
                    WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
                    OR SECURE.
                  </p>
                </div>
              </section>

              {/* Liability - Enhanced */}
              <section id="liability">
                <h2 className="text-2xl font-semibold mb-4">
                  13. Limitation of Liability
                </h2>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-muted-foreground text-sm">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AUTOMIFY
                    SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                    CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
                    LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR
                    GOODWILL.
                  </p>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  13.1 Liability Cap
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our total aggregate liability arising out of or relating to
                  these Terms or the Service shall not exceed the greater of:
                  (a) the total amount paid by you to Automify during the twelve
                  (12) months preceding the claim, or (b) one hundred US dollars
                  (USD $100).
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  13.2 Exclusions
                </h3>
                <p className="text-muted-foreground mb-4">
                  The limitations in this section do not apply to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Liability for death or personal injury caused by negligence
                  </li>
                  <li>Liability for fraud or fraudulent misrepresentation</li>
                  <li>
                    Any liability that cannot be excluded or limited under
                    applicable law
                  </li>
                  <li>
                    Breach of obligations implied by applicable consumer
                    protection laws
                  </li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  13.3 Consumer Rights
                </h3>
                <p className="text-muted-foreground">
                  If you are a consumer, these limitations do not affect any
                  rights you may have under mandatory consumer protection laws
                  in your jurisdiction that cannot be waived or limited by
                  contract.
                </p>
              </section>

              <section id="indemnification">
                <h2 className="text-2xl font-semibold mb-4">
                  14. Indemnification
                </h2>
                <p className="text-muted-foreground mb-4">
                  To the extent permitted by applicable law, you agree to
                  indemnify, defend, and hold harmless Automify and its
                  officers, directors, employees, and agents from any claims,
                  liabilities, damages, losses, and expenses (including
                  reasonable legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your infringement of any third-party rights</li>
                  <li>Your User Content</li>
                </ul>
                <p className="text-muted-foreground mt-4 text-sm">
                  This indemnification obligation does not apply to consumers
                  where prohibited by applicable consumer protection law.
                </p>
              </section>

              <section id="termination">
                <h2 className="text-2xl font-semibold mb-4">15. Termination</h2>

                <h3 className="text-lg font-medium mt-4 mb-3">
                  15.1 Termination by You
                </h3>
                <p className="text-muted-foreground mb-4">
                  You may terminate your account at any time through your
                  Account Settings. Upon termination, you will retain access
                  until the end of your current billing period for paid
                  subscriptions.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  15.2 Termination by Us
                </h3>
                <p className="text-muted-foreground mb-4">
                  We may suspend or terminate your access if you:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Breach these Terms or our Acceptable Use Policy</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Fail to pay applicable fees</li>
                  <li>Pose a security risk to the Service or other users</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  We will provide reasonable notice before termination unless
                  immediate action is required for security or legal reasons.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  15.3 Effects of Termination
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Data Access:</strong> You may export your data for
                    30 days following termination. After this period, your data
                    will be deleted in accordance with our Privacy Policy.
                  </li>
                  <li>
                    <strong>Subscriptions:</strong> No refunds will be provided
                    for unused portions of prepaid subscriptions, except as
                    required by law.
                  </li>
                  <li>
                    <strong>Integrations:</strong> All third-party connections
                    will be revoked immediately upon termination.
                  </li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">15.4 Survival</h3>
                <p className="text-muted-foreground">
                  The following sections survive termination: Limitation of
                  Liability, Indemnification, Dispute Resolution, Intellectual
                  Property, and any provisions that by their nature should
                  survive.
                </p>
              </section>

              <section id="dispute">
                <h2 className="text-2xl font-semibold mb-4">
                  16. Dispute Resolution &amp; Governing Law
                </h2>

                <h3 className="text-lg font-medium mt-4 mb-3">
                  16.1 Informal Resolution
                </h3>
                <p className="text-muted-foreground mb-4">
                  Before initiating any formal legal action, you agree to
                  contact us at legal@automify.app and attempt to resolve any
                  dispute informally for at least thirty (30) days.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  16.2 Governing Law
                </h3>
                <p className="text-muted-foreground mb-4">
                  These Terms are governed by and construed in accordance with
                  the laws of [Governing Jurisdiction], without regard to
                  conflict of law principles.
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  16.3 Jurisdiction
                </h3>
                <p className="text-muted-foreground mb-4">
                  Subject to mandatory consumer law provisions, any disputes
                  arising from these Terms shall be resolved exclusively in the
                  courts of [Jurisdiction].
                </p>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  16.4 Consumer Rights Preservation
                </h3>
                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>EU/UK Consumers:</strong> If you are a consumer in
                    the European Economic Area or United Kingdom, you retain any
                    mandatory rights under consumer protection laws. You may
                    bring proceedings in the courts of your country of
                    residence.
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>California Consumers:</strong> California residents
                    retain all rights under the California Consumer Privacy Act
                    (CCPA) and other applicable California consumer protection
                    laws.
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>India Users:</strong> Users in India retain rights
                    under the Information Technology Act and Digital Personal
                    Data Protection Act. Nothing in these Terms excludes
                    liability that cannot be excluded under applicable Indian
                    law.
                  </p>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-3">
                  16.5 Arbitration (Where Permitted)
                </h3>
                <p className="text-muted-foreground">
                  For business users and in jurisdictions where permitted,
                  disputes may be resolved through binding arbitration. This
                  arbitration clause does not apply to consumers where
                  arbitration of consumer disputes is prohibited by law,
                  including in the EU, UK, and certain other jurisdictions. You
                  retain the right to bring claims in small claims court where
                  applicable.
                </p>
              </section>

              {/* Force Majeure */}
              <section id="force-majeure">
                <h2 className="text-2xl font-semibold mb-4">
                  17. Force Majeure
                </h2>
                <p className="text-muted-foreground mb-4">
                  Neither party shall be liable for any failure or delay in
                  performing obligations under these Terms due to causes beyond
                  their reasonable control, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Natural disasters, epidemics, or pandemics</li>
                  <li>Acts of war, terrorism, or civil unrest</li>
                  <li>Government actions, laws, or regulations</li>
                  <li>Internet or telecommunications failures</li>
                  <li>Third-party service provider outages</li>
                  <li>
                    Cyberattacks or security incidents beyond reasonable
                    prevention
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  The affected party shall provide prompt notice and use
                  reasonable efforts to mitigate the impact of such events.
                </p>
              </section>

              {/* Export Control & Sanctions */}
              <section id="export">
                <h2 className="text-2xl font-semibold mb-4">
                  18. Export Control &amp; Sanctions
                </h2>
                <p className="text-muted-foreground mb-4">
                  The Service may be subject to export control and sanctions
                  laws of various jurisdictions. You agree to comply with all
                  applicable laws and represent that:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    You are not located in, or a resident of, any country
                    subject to comprehensive sanctions
                  </li>
                  <li>
                    You are not on any applicable government restricted or
                    denied parties list
                  </li>
                  <li>
                    You will not use the Service in violation of any export
                    control or sanctions laws
                  </li>
                  <li>
                    You will not transfer or permit access to the Service in
                    violation of applicable restrictions
                  </li>
                </ul>
              </section>

              {/* General */}
              <section id="general">
                <h2 className="text-2xl font-semibold mb-4">
                  19. General Provisions
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Governing Law:</strong> These Terms are governed by
                    applicable laws
                  </li>
                  <li>
                    <strong>Entire Agreement:</strong> These Terms constitute
                    the entire agreement
                  </li>
                  <li>
                    <strong>Severability:</strong> Invalid provisions don&apos;t
                    affect the rest
                  </li>
                  <li>
                    <strong>Assignment:</strong> You may not assign these Terms
                    without consent
                  </li>
                </ul>
              </section>

              {/* Changes */}
              <section id="changes">
                <h2 className="text-2xl font-semibold mb-4">
                  20. Changes to These Terms
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We
                  will provide notice of material changes by updating the
                  &quot;Last Updated&quot; date.
                </p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2 className="text-2xl font-semibold mb-4">
                  21. Contact Information
                </h2>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> legal@automify.app
                    <br />
                    <strong>Support:</strong> support@automify.app
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Sticky Table of Contents */}
          <div className="hidden lg:block w-64">
            <div className="sticky top-20">
              <h3 className="font-semibold mb-4 text-sm text-foreground">
                On this page
              </h3>
              <nav className="space-y-1 max-h-[70vh] overflow-y-auto">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="border-t border-border mt-6 pt-6">
                <Link
                  href="/privacy"
                  className="text-sm text-primary hover:underline"
                >
                  Privacy Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
