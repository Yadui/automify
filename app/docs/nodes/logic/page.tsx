import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Logic & Utility Nodes",
  description:
    "Learn about logic and utility nodes for controlling workflow flow in Automify.",
};

export default function LogicPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/nodes" className="hover:text-foreground">
          Nodes
        </Link>{" "}
        / Logic
      </div>
      <h1 className="text-4xl font-bold mb-4">Logic & Utility Nodes</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Control the flow of your workflow with conditions, delays, and data
        transformations.
      </p>

      <div className="space-y-8">
        {/* Condition */}
        <section
          id="condition"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔀</span>
            <div>
              <h2 className="text-2xl font-bold">Condition</h2>
              <p className="text-sm text-muted-foreground">
                Branch workflow logic
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Evaluates a condition and routes the workflow to different
                branches based on the result.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Field:</strong> Value to evaluate (can use variables)
                </li>
                <li>
                  <strong>Operator:</strong> equals, contains, greater than,
                  etc.
                </li>
                <li>
                  <strong>Value:</strong> Value to compare against
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Example</h3>
              <div className="bg-black/50 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground mb-2">
                  If file type is PDF, send to Notion. Otherwise, send to
                  Discord.
                </p>
                <code className="text-green-400">
                  {"{{Google Drive.mimeType}}"} equals
                  &quot;application/pdf&quot;
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Delay */}
        <section
          id="delay"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⏱️</span>
            <div>
              <h2 className="text-2xl font-bold">Delay</h2>
              <p className="text-sm text-muted-foreground">
                Pause workflow execution
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Pauses the workflow for a specified duration before continuing
                to the next node.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Duration:</strong> Time to wait
                </li>
                <li>
                  <strong>Unit:</strong> Seconds, minutes, or hours
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Use Cases</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Rate limiting API calls</li>
                <li>Waiting for external processes</li>
                <li>Scheduling follow-up actions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Transform */}
        <section
          id="transform"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔄</span>
            <div>
              <h2 className="text-2xl font-bold">Data Transform</h2>
              <p className="text-sm text-muted-foreground">
                Modify data between nodes
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Transforms, filters, or reformats data before passing it to the
                next node.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Operations</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Format:</strong> Convert data formats (JSON, text,
                  etc.)
                </li>
                <li>
                  <strong>Extract:</strong> Pull specific fields from objects
                </li>
                <li>
                  <strong>Combine:</strong> Merge multiple values
                </li>
                <li>
                  <strong>Template:</strong> Build custom strings with variables
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Output Variables</h3>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                <span className="text-green-400">
                  {"{{Data Transform.result}}"}
                </span>{" "}
                - Transformed output
              </div>
            </div>
          </div>
        </section>

        {/* KV Storage */}
        <section
          id="kv-storage"
          className="bg-muted/30 border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💾</span>
            <div>
              <h2 className="text-2xl font-bold">KV Storage</h2>
              <p className="text-sm text-muted-foreground">
                Store and retrieve data
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What it does</h3>
              <p className="text-muted-foreground">
                Store key-value pairs that persist across workflow runs. Useful
                for tracking state.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Operations</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>
                  <strong>Get:</strong> Retrieve a stored value by key
                </li>
                <li>
                  <strong>Set:</strong> Store a value with a key
                </li>
                <li>
                  <strong>Delete:</strong> Remove a stored value
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Use Cases</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Track last processed file ID</li>
                <li>Store counters or timestamps</li>
                <li>Cache API responses</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/nodes/actions"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Actions
        </Link>
        <Link href="/docs/workflows" className="text-primary hover:underline">
          Creating Workflows →
        </Link>
      </div>
    </div>
  );
}
