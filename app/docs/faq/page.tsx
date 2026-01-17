import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Automify.",
};

export default function FAQPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Quick answers to common questions about Automify.
      </p>

      <div className="space-y-4">
        {/* General */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">General</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">What is Automify?</h3>
              <p className="text-sm text-muted-foreground">
                Automify is a visual workflow automation platform that lets you
                connect apps and automate repetitive tasks. Create workflows
                that trigger automatically when events happen.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Is Automify free to use?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! We offer a free tier with limited credits. Upgrade to Pro
                or Unlimited for more credits and advanced features.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                What services can I connect?
              </h3>
              <p className="text-sm text-muted-foreground">
                Currently: Google (Gmail, Drive), Discord, Notion, Slack, and
                GitHub. We&apos;re adding more integrations regularly.
              </p>
            </div>
          </div>
        </section>

        {/* Workflows */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Workflows</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">How do I run my workflow?</h3>
              <p className="text-sm text-muted-foreground">
                Open your workflow in the editor and click the &quot;Run&quot;
                button in the toolbar to execute it manually. Or set up a
                trigger to run it automatically.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Can I schedule workflows?</h3>
              <p className="text-sm text-muted-foreground">
                Scheduled triggers are coming soon! Currently, workflows run on
                events (like file changes) or manually.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                How many workflows can I create?
              </h3>
              <p className="text-sm text-muted-foreground">
                Free tier: 3 workflows. Pro: 25 workflows. Unlimited: Unlimited
                workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Integrations</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Why isn&apos;t my integration working?
              </h3>
              <p className="text-sm text-muted-foreground">
                Go to Connections and check if the service shows a green
                checkmark. If not, click &quot;Reconnect&quot; to refresh your
                authorization.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                How do I disconnect an integration?
              </h3>
              <p className="text-sm text-muted-foreground">
                Go to Connections, find the integration, and click
                &quot;Disconnect.&quot; This revokes Automify&apos;s access to
                that service.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Is my data safe?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. We use OAuth 2.0 for all integrations, which means we never
                see your passwords. All data is encrypted in transit and at
                rest. See our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                for details.
              </p>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Account</h2>
          <div className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                How do I change my password?
              </h3>
              <p className="text-sm text-muted-foreground">
                Go to Settings → Account Security → Change Password.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                How do I delete my account?
              </h3>
              <p className="text-sm text-muted-foreground">
                Go to Settings → scroll to the bottom → click &quot;Delete
                Account.&quot; This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">How do I contact support?</h3>
              <p className="text-sm text-muted-foreground">
                Email us at support@automify.app or click the support icon in
                the header.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Still have questions */}
      <section className="mt-12 bg-primary/10 border border-primary/30 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
        <p className="text-muted-foreground mb-4">
          We&apos;re here to help! Reach out to our support team.
        </p>
        <a
          href="mailto:support@automify.app"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Contact Support
        </a>
      </section>

      {/* Nav */}
      <div className="mt-8 pt-8 border-t border-border">
        <Link
          href="/docs/navigation"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Site Navigation
        </Link>
      </div>
    </div>
  );
}
