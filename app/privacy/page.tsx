import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackToTop from "@/components/back-to-top";

export const metadata: Metadata = {
  title: "Privacy Policy | Automify",
  description:
    "Privacy Policy for Automify - Learn how we collect, use, and protect your data.",
};

const tocItems = [
  { id: "introduction", label: "1. Introduction" },
  { id: "information-collect", label: "2. Information We Collect" },
  { id: "how-we-use", label: "3. How We Use Information" },
  { id: "integrations", label: "4. Third-Party Integrations" },
  { id: "security", label: "5. Data Storage & Security" },
  { id: "retention", label: "6. Data Retention" },
  { id: "sharing", label: "7. Data Sharing" },
  { id: "rights", label: "8. Your Rights" },
  { id: "global-compliance", label: "9. Global Privacy Compliance" },
  { id: "transfers", label: "10. International Transfers" },
  { id: "children", label: "11. Children's Privacy" },
  { id: "changes", label: "12. Changes to Policy" },
  { id: "contact", label: "13. Contact Us" },
];

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>

            <div className="prose prose-invert max-w-none space-y-8">
              {/* Introduction */}
              <section id="introduction">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Automify (&quot;we,&quot; &quot;our,&quot; or
                  &quot;us&quot;). We are committed to protecting your privacy
                  and ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our workflow
                  automation platform.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By accessing or using Automify, you agree to this Privacy
                  Policy. If you do not agree, please do not use our Service.
                </p>
              </section>

              {/* Information We Collect */}
              <section id="information-collect">
                <h2 className="text-2xl font-semibold mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  2.1 Information You Provide Directly
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Account Information:</strong> Name, email address,
                    password (hashed), and profile picture.
                  </li>
                  <li>
                    <strong>Workflow Data:</strong> Workflows you create,
                    including node configurations and trigger settings.
                  </li>
                  <li>
                    <strong>Communications:</strong> Information you provide
                    when contacting support.
                  </li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  2.2 Information from Third-Party Services
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Google:</strong> Email address, name, profile
                    picture, access tokens for authorized scopes.
                  </li>
                  <li>
                    <strong>Discord:</strong> Webhook URLs for sending messages
                    to channels.
                  </li>
                  <li>
                    <strong>Notion:</strong> Access tokens, workspace
                    information, database IDs.
                  </li>
                  <li>
                    <strong>Slack:</strong> Access tokens, workspace
                    information, channel lists.
                  </li>
                  <li>
                    <strong>GitHub:</strong> Email address, username, profile
                    picture for authentication.
                  </li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  2.3 Information Collected Automatically
                </h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Usage Data:</strong> Pages visited, features used,
                    workflow execution logs.
                  </li>
                  <li>
                    <strong>Device Information:</strong> Browser type, operating
                    system, device type.
                  </li>
                  <li>
                    <strong>Cookies:</strong> Session cookies for authentication
                    and preferences.
                  </li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section id="how-we-use">
                <h2 className="text-2xl font-semibold mb-4">
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Execute your automated workflows and integrations</li>
                  <li>Authenticate your identity and manage your account</li>
                  <li>
                    Send transactional emails and important service updates
                  </li>
                  <li>Respond to inquiries and provide customer support</li>
                  <li>
                    Detect, prevent, and address technical issues and security
                    threats
                  </li>
                  <li>Comply with legal obligations and enforce our terms</li>
                </ul>
              </section>

              {/* Third-Party Integrations */}
              <section id="integrations">
                <h2 className="text-2xl font-semibold mb-4">
                  4. Third-Party Integrations & OAuth
                </h2>
                <p className="text-muted-foreground mb-4">
                  Automify integrates with third-party services using OAuth 2.0.
                  When you connect a service:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    You are redirected to the third-party service to grant
                    permission
                  </li>
                  <li>
                    We only request minimum permissions necessary for the
                    integration
                  </li>
                  <li>Access tokens are securely stored and encrypted</li>
                  <li>
                    You can revoke access at any time through your settings
                  </li>
                </ul>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Google</h4>
                    <p className="text-sm text-muted-foreground">
                      Gmail: Send emails. Drive: Access files, receive
                      notifications.
                    </p>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Discord</h4>
                    <p className="text-sm text-muted-foreground">
                      Create webhooks to send messages. No message reading.
                    </p>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Notion</h4>
                    <p className="text-sm text-muted-foreground">
                      Read/write to authorized databases. Create pages.
                    </p>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Slack</h4>
                    <p className="text-sm text-muted-foreground">
                      Post messages to channels. List channels.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Storage & Security */}
              <section id="security">
                <h2 className="text-2xl font-semibold mb-4">
                  5. Data Storage & Security
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Encryption:</strong> All data encrypted in transit
                    (TLS 1.3) and at rest (AES-256).
                  </li>
                  <li>
                    <strong>Secure Storage:</strong> Data stored on secure cloud
                    infrastructure.
                  </li>
                  <li>
                    <strong>Password Security:</strong> Passwords hashed using
                    Argon2id.
                  </li>
                  <li>
                    <strong>Access Controls:</strong> Strict access controls and
                    audit logging.
                  </li>
                  <li>
                    <strong>Token Security:</strong> OAuth tokens encrypted and
                    stored securely.
                  </li>
                </ul>
              </section>

              {/* Data Retention */}
              <section id="retention">
                <h2 className="text-2xl font-semibold mb-4">
                  6. Data Retention
                </h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Account Data:</strong> Retained until you delete
                    your account.
                  </li>
                  <li>
                    <strong>Workflow Data:</strong> Retained until you delete
                    the workflow or account.
                  </li>
                  <li>
                    <strong>Execution Logs:</strong> Retained for 90 days for
                    debugging.
                  </li>
                  <li>
                    <strong>OAuth Tokens:</strong> Retained until you disconnect
                    the integration.
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Upon account deletion, we delete or anonymize your data within
                  30 days.
                </p>
              </section>

              {/* Data Sharing */}
              <section id="sharing">
                <h2 className="text-2xl font-semibold mb-4">
                  7. Data Sharing & Disclosure
                </h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>With Your Consent:</strong> When you explicitly
                    authorize sharing.
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Trusted vendors
                    assisting in operating our Service.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    government request.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with
                    merger or acquisition.
                  </li>
                </ul>
              </section>

              {/* Your Rights */}
              <section id="rights">
                <h2 className="text-2xl font-semibold mb-4">
                  8. Your Rights & Choices
                </h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal
                    data.
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of
                    inaccurate data.
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    data.
                  </li>
                  <li>
                    <strong>Portability:</strong> Request your data in a
                    portable format.
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent where
                    applicable.
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Contact privacy@automify.app to exercise these rights.
                </p>
              </section>

              {/* Global Privacy Rights & Legal Compliance */}
              <section id="global-compliance">
                <h2 className="text-2xl font-semibold mb-4">
                  9. Global Privacy Rights &amp; Legal Compliance
                </h2>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  9.1 Data Controller
                </h3>
                <p className="text-muted-foreground mb-4">
                  For the purposes of applicable data protection laws, Automify
                  is the data controller responsible for your personal data.
                  This means we determine the purposes and means of processing
                  your personal information.
                </p>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  9.2 Legal Bases for Processing
                </h3>
                <p className="text-muted-foreground mb-4">
                  We process your personal data based on the following legal
                  grounds:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Contractual Necessity:</strong> Processing necessary
                    to perform our contract with you (e.g., providing the
                    Service, managing your account, executing workflows).
                  </li>
                  <li>
                    <strong>Consent:</strong> Where you have provided explicit
                    consent (e.g., connecting third-party integrations,
                    receiving marketing communications).
                  </li>
                  <li>
                    <strong>Legitimate Interests:</strong> Processing necessary
                    for our legitimate business interests (e.g., improving our
                    Service, fraud prevention, security), provided these do not
                    override your rights.
                  </li>
                  <li>
                    <strong>Legal Obligation:</strong> Processing required to
                    comply with applicable laws and regulations.
                  </li>
                </ul>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  9.3 Rights by Jurisdiction
                </h3>

                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2">
                    European Economic Area (EEA) &amp; United Kingdom
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Under the GDPR and UK GDPR, you have the following rights:
                  </p>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>Right of access to your personal data</li>
                    <li>Right to rectification of inaccurate data</li>
                    <li>
                      Right to erasure (&quot;right to be forgotten&quot;)
                    </li>
                    <li>Right to restriction of processing</li>
                    <li>Right to data portability</li>
                    <li>
                      Right to object to processing based on legitimate
                      interests
                    </li>
                    <li>Right to withdraw consent at any time</li>
                    <li>
                      Right to lodge a complaint with a supervisory authority
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2">
                    California, United States
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Under the CCPA and CPRA, California residents have specific
                    rights:
                  </p>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>
                      Right to know what personal information is collected
                    </li>
                    <li>
                      Right to know whether personal information is sold or
                      shared
                    </li>
                    <li>
                      Right to opt-out of sale or sharing of personal
                      information
                    </li>
                    <li>Right to request deletion of personal information</li>
                    <li>Right to correct inaccurate personal information</li>
                    <li>
                      Right to limit use of sensitive personal information
                    </li>
                    <li>
                      Right to non-discrimination for exercising your rights
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>We do not sell your personal information.</strong>
                  </p>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-2">India</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Under the Digital Personal Data Protection Act (DPDP), you
                    have:
                  </p>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                    <li>
                      Right to access a summary of personal data processed
                    </li>
                    <li>Right to correction and erasure of personal data</li>
                    <li>
                      Right to nominate another individual to exercise rights
                    </li>
                    <li>Right to grievance redressal</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                </div>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  9.4 Exercising Your Rights
                </h3>
                <p className="text-muted-foreground mb-4">
                  To exercise any of your privacy rights, you may:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Email us at privacy@automify.app with your request</li>
                  <li>Use the self-service options in your Account Settings</li>
                  <li>
                    Submit a request to our Data Protection Officer at
                    dpo@automify.app
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We will respond to verified requests within the timeframes
                  required by applicable law (generally 30 days for GDPR, 45
                  days for CCPA).
                </p>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  9.5 Automated Decision-Making
                </h3>
                <p className="text-muted-foreground">
                  Automify does not use automated decision-making or profiling
                  that produces legal effects or similarly significant effects
                  on you. Workflow automations are configured and controlled by
                  you, and do not involve decisions made solely by automated
                  means that affect your legal rights or status.
                </p>

                <h3 className="text-xl font-medium mt-6 mb-3">
                  9.6 Cookies &amp; Similar Technologies
                </h3>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies as follows:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for
                    authentication, security, and core functionality. These
                    cannot be disabled.
                  </li>
                  <li>
                    <strong>Optional Cookies:</strong> Used for analytics and
                    performance improvements. You may opt out of these through
                    your browser settings or our cookie preferences.
                  </li>
                </ul>
              </section>

              {/* International Transfers */}
              <section id="transfers">
                <h2 className="text-2xl font-semibold mb-4">
                  10. International Data Transfers
                </h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place, including standard contractual
                  clauses.
                </p>
              </section>

              {/* Children's Privacy */}
              <section id="children">
                <h2 className="text-2xl font-semibold mb-4">
                  11. Children&apos;s Privacy
                </h2>
                <p className="text-muted-foreground">
                  Automify is not intended for children under 16. We do not
                  knowingly collect personal information from children. Contact
                  us immediately if you believe we have.
                </p>
              </section>

              {/* Updates */}
              <section id="changes">
                <h2 className="text-2xl font-semibold mb-4">
                  12. Changes to This Policy
                </h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes by posting the new Privacy
                  Policy and updating the &quot;Last Updated&quot; date.
                </p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy, please
                  contact us:
                </p>
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> privacy@automify.app
                    <br />
                    <strong>Data Protection Officer:</strong> dpo@automify.app
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
              <nav className="space-y-2">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="border-t border-border mt-6 pt-6">
                <Link
                  href="/terms"
                  className="text-sm text-primary hover:underline"
                >
                  Terms of Service →
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
