import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notion Integration",
  description:
    "Set up Notion integration with Automify to create pages in databases.",
};

export default function NotionIntegrationPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/integrations" className="hover:text-foreground">
          Integrations
        </Link>{" "}
        / Notion
      </div>
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/notion.png"
          alt="Notion"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-4xl font-bold">Notion Integration</h1>
      </div>
      <p className="text-xl text-muted-foreground mb-8">
        Create pages in Notion databases automatically from your workflows.
      </p>

      {/* What You Get */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What You Get</h2>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="/notion.png"
              alt="Notion"
              className="w-6 h-6 object-contain"
            />
            <h3 className="font-semibold">Notion (Action)</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Create new pages in any Notion database you authorize.
          </p>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Setup Steps</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-4">
            <li>
              <strong>Go to Connections</strong>
              <p className="text-sm">
                Click &quot;Connections&quot; in the sidebar.
              </p>
            </li>
            <li>
              <strong>Find Notion</strong>
              <p className="text-sm">Locate the Notion card.</p>
            </li>
            <li>
              <strong>Click Connect</strong>
              <p className="text-sm">You&apos;ll be redirected to Notion.</p>
            </li>
            <li>
              <strong>Select Pages/Databases</strong>
              <p className="text-sm">
                <strong>Important:</strong> Choose which pages and databases
                Automify can access. Only selected items will be available in
                workflows.
              </p>
            </li>
            <li>
              <strong>Authorize</strong>
              <p className="text-sm">Approve the integration.</p>
            </li>
            <li>
              <strong>Done!</strong>
              <p className="text-sm">
                Your Notion databases are now available in workflows.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Important Note */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Important: Selecting Databases
        </h2>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-muted-foreground mb-3">
            During Notion authorization, you must explicitly select which
            databases Automify can access:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
            <li>Click the pages/databases that contain your target database</li>
            <li>
              If you don&apos;t select a database, it won&apos;t appear in
              workflows
            </li>
            <li>You can reconnect later to add more databases</li>
          </ul>
        </div>
      </section>

      {/* Using in Workflows */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Using in Workflows</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
            <li>Add a Notion node to your workflow</li>
            <li>Select your database from the dropdown</li>
            <li>Enter the page content (can use variables)</li>
            <li>
              The page will be created with generic content matching your
              database schema
            </li>
          </ol>
        </div>
      </section>

      {/* Permissions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Permissions</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Read content</strong>
                <p className="text-sm">View databases and their schemas.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Create pages</strong>
                <p className="text-sm">
                  Add new pages to authorized databases.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/integrations/discord"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Discord
        </Link>
        <Link
          href="/docs/integrations/slack"
          className="text-primary hover:underline"
        >
          Slack →
        </Link>
      </div>
    </div>
  );
}
