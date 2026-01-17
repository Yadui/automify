import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Connect your favorite services to Automify - Google, Discord, Notion, Slack, and more.",
};

export default function IntegrationsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Integrations</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Connect your favorite services to power your workflows.
      </p>

      {/* Available Integrations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs/integrations/google"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/googleDrive.png"
                alt="Google"
                className="w-8 h-8 object-contain"
              />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                Google
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Gmail & Google Drive
            </p>
            <span className="text-xs text-primary flex items-center gap-1">
              View setup <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/docs/integrations/discord"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/discord.png"
                alt="Discord"
                className="w-8 h-8 object-contain"
              />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                Discord
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Send messages via webhooks
            </p>
            <span className="text-xs text-primary flex items-center gap-1">
              View setup <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/docs/integrations/notion"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/notion.png"
                alt="Notion"
                className="w-8 h-8 object-contain"
              />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                Notion
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Create pages in databases
            </p>
            <span className="text-xs text-primary flex items-center gap-1">
              View setup <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/docs/integrations/slack"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/slack.png"
                alt="Slack"
                className="w-8 h-8 object-contain"
              />
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                Slack
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Post messages to channels
            </p>
            <span className="text-xs text-primary flex items-center gap-1">
              View setup <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </section>

      {/* How to Connect */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Connect an Integration
        </h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
            <li>
              <strong>Go to Connections</strong>
              <p className="text-sm">
                Click &quot;Connections&quot; in the sidebar navigation.
              </p>
            </li>
            <li>
              <strong>Find the Service</strong>
              <p className="text-sm">
                Locate the service you want to connect (e.g., Google, Discord).
              </p>
            </li>
            <li>
              <strong>Click Connect</strong>
              <p className="text-sm">
                Click the &quot;Connect&quot; button next to the service.
              </p>
            </li>
            <li>
              <strong>Authorize</strong>
              <p className="text-sm">
                You&apos;ll be redirected to the service to grant Automify
                access.
              </p>
            </li>
            <li>
              <strong>Done!</strong>
              <p className="text-sm">
                A green checkmark appears when successfully connected.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* OAuth Explained */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How We Connect to Your Services
        </h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            We use <strong>OAuth 2.0</strong>, an industry-standard
            authorization protocol:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              We <strong>never see your password</strong> - you authorize
              directly with the service
            </li>
            <li>
              We only request <strong>minimum permissions</strong> needed for
              the integration
            </li>
            <li>
              Access tokens are <strong>encrypted and stored securely</strong>
            </li>
            <li>
              You can <strong>revoke access anytime</strong> from your
              Connections page
            </li>
          </ul>
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-50">
            <span className="text-2xl">🐙</span>
            <p className="text-sm mt-2">GitHub</p>
          </div>
          <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-50">
            <span className="text-2xl">📋</span>
            <p className="text-sm mt-2">Trello</p>
          </div>
          <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-50">
            <span className="text-2xl">📊</span>
            <p className="text-sm mt-2">Airtable</p>
          </div>
          <div className="p-4 border border-dashed border-border rounded-lg text-center opacity-50">
            <span className="text-2xl">🎫</span>
            <p className="text-sm mt-2">Linear</p>
          </div>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border">
        <Link
          href="/docs/integrations/google"
          className="text-primary hover:underline"
        >
          Google Integration →
        </Link>
      </div>
    </div>
  );
}
