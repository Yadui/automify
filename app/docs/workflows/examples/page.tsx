import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Example Workflows",
  description: "Ready-to-use workflow examples and templates for Automify.",
};

export default function ExamplesPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/workflows" className="hover:text-foreground">
          Workflows
        </Link>{" "}
        / Examples
      </div>
      <h1 className="text-4xl font-bold mb-4">Example Workflows</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Get inspired by these ready-to-use workflow examples. Copy and customize
        them for your needs.
      </p>

      <div className="space-y-8">
        {/* Example 1: Drive to Discord */}
        <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              Beginner
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            📁 → 💬 Drive to Discord Notifier
          </h2>
          <p className="text-muted-foreground mb-4">
            Get notified in Discord whenever a new file is uploaded to Google
            Drive.
          </p>

          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Workflow Structure</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="p-3 bg-green-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">📁</div>
                <div className="text-xs">Google Drive</div>
                <div className="text-xs text-muted-foreground">Trigger</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="p-3 bg-blue-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">💬</div>
                <div className="text-xs">Discord</div>
                <div className="text-xs text-muted-foreground">Action</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Setup Steps</h3>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-1 text-sm">
              <li>Connect Google Drive and Discord integrations</li>
              <li>Create a new workflow</li>
              <li>Configure Drive trigger (select folder to watch)</li>
              <li>
                Add Discord node, set message: &quot;New file:{" "}
                {"{{Google Drive.fileName}}"}&quot;
              </li>
              <li>Save and test!</li>
            </ol>
          </div>
        </section>

        {/* Example 2: Drive to Notion + Slack */}
        <section className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
              Intermediate
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">📁 → 📝 → 💼 File Logger</h2>
          <p className="text-muted-foreground mb-4">
            Log new Drive files to a Notion database and notify team on Slack.
          </p>

          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Workflow Structure</h3>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="p-3 bg-green-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">📁</div>
                <div className="text-xs">Google Drive</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="p-3 bg-blue-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">📝</div>
                <div className="text-xs">Notion</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="p-3 bg-blue-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">💼</div>
                <div className="text-xs">Slack</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Use Case</h3>
            <p className="text-muted-foreground text-sm">
              Perfect for teams that need to track shared files and keep
              everyone informed about new uploads.
            </p>
          </div>
        </section>

        {/* Example 3: Webhook to Multi-channel */}
        <section className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
              Advanced
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            🔗 → 🔀 → Multi-Channel Broadcaster
          </h2>
          <p className="text-muted-foreground mb-4">
            Receive webhooks and broadcast to multiple platforms based on
            content type.
          </p>

          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Workflow Structure</h3>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="p-3 bg-green-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">🔗</div>
                <div className="text-xs">Webhook</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="p-3 bg-purple-500/20 rounded-lg text-center">
                <div className="text-lg mb-1">🔀</div>
                <div className="text-xs">Condition</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex flex-col gap-2">
                <div className="p-2 bg-blue-500/20 rounded text-center text-xs">
                  Discord
                </div>
                <div className="p-2 bg-blue-500/20 rounded text-center text-xs">
                  Slack
                </div>
                <div className="p-2 bg-blue-500/20 rounded text-center text-xs">
                  Email
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Use Case</h3>
            <p className="text-muted-foreground text-sm">
              Route incoming events to different channels based on priority,
              type, or source.
            </p>
          </div>
        </section>

        {/* Example 4: Daily Email Digest */}
        <section className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
              Coming Soon
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">⏰ → 📊 → ✉️ Daily Digest</h2>
          <p className="text-muted-foreground mb-4">
            Compile daily activity into a summary email sent every morning.
          </p>

          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Workflow Structure</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="p-3 bg-green-500/20 rounded-lg text-center opacity-50">
                <div className="text-lg mb-1">⏰</div>
                <div className="text-xs">Schedule</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="p-3 bg-purple-500/20 rounded-lg text-center opacity-50">
                <div className="text-lg mb-1">📊</div>
                <div className="text-xs">Data Transform</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="p-3 bg-blue-500/20 rounded-lg text-center opacity-50">
                <div className="text-lg mb-1">✉️</div>
                <div className="text-xs">Gmail</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/workflows"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Creating Workflows
        </Link>
        <Link
          href="/docs/workflows/variables"
          className="text-primary hover:underline"
        >
          Using Variables →
        </Link>
      </div>
    </div>
  );
}
