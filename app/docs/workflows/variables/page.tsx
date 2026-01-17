import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Using Variables",
  description:
    "Learn how to pass data between nodes using variables in Automify workflows.",
};

export default function VariablesPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/workflows" className="hover:text-foreground">
          Workflows
        </Link>{" "}
        / Variables
      </div>
      <h1 className="text-4xl font-bold mb-4">Using Variables</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Pass data between nodes to create dynamic, data-driven workflows.
      </p>

      {/* What are Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What are Variables?</h2>
        <p className="text-muted-foreground mb-4">
          Variables allow you to reference output data from previous nodes in
          your workflow. When a node executes, it produces output that can be
          used by subsequent nodes.
        </p>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Variable Syntax</h3>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-lg text-center">
            <span className="text-green-400">
              {"{{"}NodeName.field{"}}"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Replace <code className="bg-black/50 px-1 rounded">NodeName</code>{" "}
            with the node type and{" "}
            <code className="bg-black/50 px-1 rounded">field</code> with the
            data you want.
          </p>
        </div>
      </section>

      {/* Common Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Common Variables by Node</h2>

        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">📁 Google Drive (Trigger)</h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-2">
              <div>
                <span className="text-green-400">
                  {"{{Google Drive.fileName}}"}
                </span>{" "}
                <span className="text-muted-foreground">- File name</span>
              </div>
              <div>
                <span className="text-green-400">
                  {"{{Google Drive.fileUrl}}"}
                </span>{" "}
                <span className="text-muted-foreground">- File URL</span>
              </div>
              <div>
                <span className="text-green-400">
                  {"{{Google Drive.fileId}}"}
                </span>{" "}
                <span className="text-muted-foreground">- Unique file ID</span>
              </div>
              <div>
                <span className="text-green-400">
                  {"{{Google Drive.mimeType}}"}
                </span>{" "}
                <span className="text-muted-foreground">- File type</span>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">🔗 Webhook (Trigger)</h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-2">
              <div>
                <span className="text-green-400">{"{{Webhook.body}}"}</span>{" "}
                <span className="text-muted-foreground">
                  - Request body (JSON)
                </span>
              </div>
              <div>
                <span className="text-green-400">{"{{Webhook.headers}}"}</span>{" "}
                <span className="text-muted-foreground">- Request headers</span>
              </div>
              <div>
                <span className="text-green-400">
                  {"{{Webhook.body.fieldName}}"}
                </span>{" "}
                <span className="text-muted-foreground">
                  - Specific field from body
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">🌐 HTTP Request (Action)</h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-2">
              <div>
                <span className="text-green-400">
                  {"{{HTTP Request.response}}"}
                </span>{" "}
                <span className="text-muted-foreground">- Response body</span>
              </div>
              <div>
                <span className="text-green-400">
                  {"{{HTTP Request.status}}"}
                </span>{" "}
                <span className="text-muted-foreground">
                  - HTTP status code
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">🔄 Data Transform (Logic)</h3>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-2">
              <div>
                <span className="text-green-400">
                  {"{{Data Transform.result}}"}
                </span>{" "}
                <span className="text-muted-foreground">
                  - Transformed output
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Using Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Use Variables</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. In Text Fields</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Any text field (messages, subjects, etc.) can include variables:
            </p>
            <div className="bg-black/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">Discord message:</p>
              <p className="text-green-400 mt-1">
                &quot;🎉 New file uploaded: {"{{Google Drive.fileName}}"}
                \n\nView it here: {"{{Google Drive.fileUrl}}"}&quot;
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Mixed with Static Text</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Combine variables with regular text freely:
            </p>
            <div className="bg-black/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">Email subject:</p>
              <p className="text-green-400 mt-1">
                &quot;[Automify] New document: {"{{Google Drive.fileName}}"}
                &quot;
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Accessing Nested Data</h3>
            <p className="text-muted-foreground text-sm mb-3">
              For JSON data, use dot notation to access nested fields:
            </p>
            <div className="bg-black/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                If webhook body is: {'{"user": {"name": "John"}}'}
              </p>
              <p className="text-green-400 mt-1">
                {"{{Webhook.body.user.name}}"} → &quot;John&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tips & Best Practices</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">💡 Use the Variable Picker</h3>
            <p className="text-sm text-muted-foreground">
              When typing in a text field, type{" "}
              <code className="bg-black/50 px-1 rounded">{"{"}</code> to see
              available variables from previous nodes.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">⚠️ Order Matters</h3>
            <p className="text-sm text-muted-foreground">
              You can only reference variables from nodes that come{" "}
              <em>before</em> the current node in the workflow.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔍 Test First</h3>
            <p className="text-sm text-muted-foreground">
              Run your workflow with a Toast node to verify variables contain
              the expected values.
            </p>
          </div>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/workflows/examples"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Example Workflows
        </Link>
        <Link href="/docs/faq" className="text-primary hover:underline">
          FAQ →
        </Link>
      </div>
    </div>
  );
}
