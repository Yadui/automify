import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trigger Nodes",
  description: "Learn about trigger nodes that start your Automify workflows.",
};

export default function TriggersPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/nodes" className="hover:text-foreground">
          Nodes
        </Link>{" "}
        / Triggers
      </div>
      <h1 className="text-4xl font-bold mb-4">Trigger Nodes</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Triggers start your workflow when a specific event occurs. Every
        workflow must begin with a trigger.
      </p>

      <div className="space-y-8">
        {/* Google Drive */}
        <section
          id="google-drive"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/googleDrive.png"
              alt="Google Drive"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold">Google Drive</h2>
              <p className="text-sm text-muted-foreground">
                Trigger on file changes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Starts your workflow when a file is added, modified, or deleted
                in your Google Drive.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Folder ID:</strong> (Optional) Specific folder to
                  watch
                </li>
                <li>
                  <strong>File types:</strong> (Optional) Filter by file
                  extension
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Output Variables</h3>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-1">
                <div>
                  <span className="text-green-400">
                    {"{{Google Drive.fileName}}"}
                  </span>{" "}
                  - Name of the file
                </div>
                <div>
                  <span className="text-green-400">
                    {"{{Google Drive.fileUrl}}"}
                  </span>{" "}
                  - URL to the file
                </div>
                <div>
                  <span className="text-green-400">
                    {"{{Google Drive.fileId}}"}
                  </span>{" "}
                  - Unique file ID
                </div>
                <div>
                  <span className="text-green-400">
                    {"{{Google Drive.mimeType}}"}
                  </span>{" "}
                  - File type
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-muted-foreground">
                Requires{" "}
                <Link
                  href="/docs/integrations/google"
                  className="text-primary hover:underline"
                >
                  Google integration
                </Link>{" "}
                to be connected.
              </p>
            </div>
          </div>
        </section>

        {/* Webhook */}
        <section
          id="webhook"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔗</span>
            <div>
              <h2 className="text-2xl font-bold">Webhook (Incoming)</h2>
              <p className="text-sm text-muted-foreground">
                Trigger via HTTP request
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Starts your workflow when an external service sends an HTTP POST
                request to your unique webhook URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Webhook URL:</strong> Auto-generated unique URL for
                  this workflow
                </li>
                <li>
                  <strong>Secret:</strong> (Optional) Validate incoming requests
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Output Variables</h3>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-1">
                <div>
                  <span className="text-green-400">{"{{Webhook.body}}"}</span> -
                  JSON body of the request
                </div>
                <div>
                  <span className="text-green-400">
                    {"{{Webhook.headers}}"}
                  </span>{" "}
                  - Request headers
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Use Cases</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>GitHub push notifications</li>
                <li>Stripe payment webhooks</li>
                <li>Custom app integrations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section
          id="schedule"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⏰</span>
            <div>
              <h2 className="text-2xl font-bold">Schedule</h2>
              <p className="text-sm text-muted-foreground">
                Trigger on a schedule
              </p>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Starts your workflow at scheduled intervals (hourly, daily,
                weekly, or custom cron).
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Interval:</strong> How often to run (e.g., every hour)
                </li>
                <li>
                  <strong>Cron expression:</strong> For custom schedules
                </li>
                <li>
                  <strong>Timezone:</strong> Your preferred timezone
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/nodes"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Nodes
        </Link>
        <Link
          href="/docs/nodes/actions"
          className="text-primary hover:underline"
        >
          Actions →
        </Link>
      </div>
    </div>
  );
}
