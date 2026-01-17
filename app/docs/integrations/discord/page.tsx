import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Discord Integration",
  description:
    "Set up Discord integration with Automify to send messages to channels.",
};

export default function DiscordIntegrationPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/integrations" className="hover:text-foreground">
          Integrations
        </Link>{" "}
        / Discord
      </div>
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/discord.png"
          alt="Discord"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-4xl font-bold">Discord Integration</h1>
      </div>
      <p className="text-xl text-muted-foreground mb-8">
        Send automated messages to Discord channels using webhooks.
      </p>

      {/* What You Get */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What You Get</h2>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="/discord.png"
              alt="Discord"
              className="w-6 h-6 object-contain"
            />
            <h3 className="font-semibold">Discord (Action)</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Post messages to Discord channels automatically when your workflows
            run.
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
              <strong>Find Discord</strong>
              <p className="text-sm">Locate the Discord card.</p>
            </li>
            <li>
              <strong>Click Connect</strong>
              <p className="text-sm">You&apos;ll be redirected to Discord.</p>
            </li>
            <li>
              <strong>Select Server & Channel</strong>
              <p className="text-sm">
                Choose which server and channel to create the webhook for.
              </p>
            </li>
            <li>
              <strong>Authorize</strong>
              <p className="text-sm">
                Approve Automify to create a webhook in the selected channel.
              </p>
            </li>
            <li>
              <strong>Done!</strong>
              <p className="text-sm">
                The webhook is saved and ready to use in workflows.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Requirements</h2>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-muted-foreground">
            <strong>Important:</strong> You need{" "}
            <strong>&quot;Manage Webhooks&quot;</strong> permission in the
            Discord server to create a webhook. If you don&apos;t have this
            permission, ask a server administrator to grant it.
          </p>
        </div>
      </section>

      {/* Permissions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What Automify Can Access</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Create webhooks in selected channel</strong>
                <p className="text-sm">
                  Used to post messages to your Discord channel.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500">✗</span>
              <div>
                <strong>Read messages</strong>
                <p className="text-sm">
                  We cannot read any messages in your server.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500">✗</span>
              <div>
                <strong>Access other channels</strong>
                <p className="text-sm">
                  Only the channels you explicitly authorize.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Usage */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Using in Workflows</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
            <li>Add a Discord node to your workflow</li>
            <li>Select the connected webhook from the dropdown</li>
            <li>
              Write your message (can include variables like{" "}
              <code className="bg-black/50 px-1 rounded">
                {"{{Google Drive.fileName}}"}
              </code>
              )
            </li>
            <li>Save and run your workflow</li>
          </ol>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/integrations/google"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Google
        </Link>
        <Link
          href="/docs/integrations/notion"
          className="text-primary hover:underline"
        >
          Notion →
        </Link>
      </div>
    </div>
  );
}
