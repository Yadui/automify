import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Action Nodes",
  description:
    "Learn about action nodes that perform tasks in your Automify workflows.",
};

export default function ActionsPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/nodes" className="hover:text-foreground">
          Nodes
        </Link>{" "}
        / Actions
      </div>
      <h1 className="text-4xl font-bold mb-4">Action Nodes</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Actions perform tasks in your connected services. Add them after
        triggers to automate your work.
      </p>

      <div className="space-y-8">
        {/* Gmail */}
        <section
          id="gmail"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/gmailLogo.png"
              alt="Gmail"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold">Gmail</h2>
              <p className="text-sm text-muted-foreground">Send emails</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Sends an email from your connected Gmail account.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>To:</strong> Recipient email address(es)
                </li>
                <li>
                  <strong>Subject:</strong> Email subject line
                </li>
                <li>
                  <strong>Message:</strong> Email body content
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Example</h3>
              <div className="bg-black/50 rounded-lg p-4 text-sm space-y-2">
                <div>
                  <span className="text-muted-foreground">To:</span>{" "}
                  team@example.com
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span> New
                  file uploaded: {"{{Google Drive.fileName}}"}
                </div>
                <div>
                  <span className="text-muted-foreground">Message:</span> A new
                  file was added: {"{{Google Drive.fileUrl}}"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discord */}
        <section
          id="discord"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/discord.png"
              alt="Discord"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold">Discord</h2>
              <p className="text-sm text-muted-foreground">
                Post messages to channels
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Sends a message to a Discord channel via webhook.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Channel:</strong> Select from connected webhooks
                </li>
                <li>
                  <strong>Message:</strong> Content to send
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-muted-foreground">
                Requires{" "}
                <Link
                  href="/docs/integrations/discord"
                  className="text-primary hover:underline"
                >
                  Discord integration
                </Link>{" "}
                with webhook access.
              </p>
            </div>
          </div>
        </section>

        {/* Notion */}
        <section
          id="notion"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/notion.png"
              alt="Notion"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold">Notion</h2>
              <p className="text-sm text-muted-foreground">
                Create database pages
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Creates a new page in a Notion database.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Database:</strong> Select from authorized databases
                </li>
                <li>
                  <strong>Content:</strong> Page title/content
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-muted-foreground">
                Requires{" "}
                <Link
                  href="/docs/integrations/notion"
                  className="text-primary hover:underline"
                >
                  Notion integration
                </Link>{" "}
                with database access.
              </p>
            </div>
          </div>
        </section>

        {/* Slack */}
        <section
          id="slack"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/slack.png"
              alt="Slack"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold">Slack</h2>
              <p className="text-sm text-muted-foreground">
                Send Slack messages
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Posts a message to a Slack channel or conversation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Channel:</strong> Select from available channels
                </li>
                <li>
                  <strong>Message:</strong> Content to send
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Toast */}
        <section
          id="toast"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔔</span>
            <div>
              <h2 className="text-2xl font-bold">Toast</h2>
              <p className="text-sm text-muted-foreground">
                Browser notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Shows a toast notification in your browser. Useful for testing
                and debugging workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Message:</strong> Notification content
                </li>
                <li>
                  <strong>Type:</strong> Success, Error, Info, or Warning
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* HTTP Request */}
        <section
          id="http"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🌐</span>
            <div>
              <h2 className="text-2xl font-bold">HTTP Request</h2>
              <p className="text-sm text-muted-foreground">Make API calls</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Makes a custom HTTP request to any URL. Perfect for connecting
                to APIs not directly supported.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>URL:</strong> Endpoint to call
                </li>
                <li>
                  <strong>Method:</strong> GET, POST, PUT, DELETE, etc.
                </li>
                <li>
                  <strong>Headers:</strong> Custom headers (JSON)
                </li>
                <li>
                  <strong>Body:</strong> Request body (for POST/PUT)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Output Variables</h3>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-1">
                <div>
                  <span className="text-green-400">
                    {"{{HTTP Request.response}}"}
                  </span>{" "}
                  - Response body
                </div>
                <div>
                  <span className="text-green-400">
                    {"{{HTTP Request.status}}"}
                  </span>{" "}
                  - HTTP status code
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/nodes/triggers"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Triggers
        </Link>
        <Link href="/docs/nodes/logic" className="text-primary hover:underline">
          Logic & Utilities →
        </Link>
      </div>
    </div>
  );
}
