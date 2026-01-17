import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Slack Integration",
  description:
    "Set up Slack integration with Automify to send messages to channels.",
};

export default function SlackIntegrationPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/integrations" className="hover:text-foreground">
          Integrations
        </Link>{" "}
        / Slack
      </div>
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/slack.png"
          alt="Slack"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-4xl font-bold">Slack Integration</h1>
      </div>
      <p className="text-xl text-muted-foreground mb-8">
        Send automated messages to Slack channels from your workflows.
      </p>

      {/* What You Get */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What You Get</h2>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="/slack.png"
              alt="Slack"
              className="w-6 h-6 object-contain"
            />
            <h3 className="font-semibold">Slack (Action)</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Post messages to any Slack channel in your workspace.
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
              <strong>Find Slack</strong>
              <p className="text-sm">Locate the Slack card.</p>
            </li>
            <li>
              <strong>Click Connect</strong>
              <p className="text-sm">You&apos;ll be redirected to Slack.</p>
            </li>
            <li>
              <strong>Select Workspace</strong>
              <p className="text-sm">
                Choose which Slack workspace to connect.
              </p>
            </li>
            <li>
              <strong>Authorize</strong>
              <p className="text-sm">
                Allow Automify to post messages and view channels.
              </p>
            </li>
            <li>
              <strong>Done!</strong>
              <p className="text-sm">
                Your Slack channels are now available in workflows.
              </p>
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
                <strong>Post messages</strong>
                <p className="text-sm">
                  Send messages to channels where the bot is added.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>View channels</strong>
                <p className="text-sm">
                  List available channels for selection.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Using in Workflows */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Using in Workflows</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
            <li>Add a Slack node to your workflow</li>
            <li>Select the target channel from the dropdown</li>
            <li>Write your message (supports variables)</li>
            <li>Save and run!</li>
          </ol>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tips</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">💡 Add the bot to channels</h3>
            <p className="text-sm text-muted-foreground">
              If you can&apos;t post to a channel, make sure the Automify bot is
              added to that channel first.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">💡 Use mentions</h3>
            <p className="text-sm text-muted-foreground">
              You can include @mentions in your messages to notify specific
              people.
            </p>
          </div>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/integrations/notion"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Notion
        </Link>
        <Link href="/docs/nodes" className="text-primary hover:underline">
          Node Types →
        </Link>
      </div>
    </div>
  );
}
