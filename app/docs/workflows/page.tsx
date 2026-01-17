import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creating Workflows",
  description: "Learn how to create and manage workflows in Automify.",
};

export default function WorkflowsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Creating Workflows</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Learn how to build, configure, and run automated workflows.
      </p>

      {/* Creating a Workflow */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Creating a New Workflow</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-4">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
            <li>
              <strong>Navigate to Workflows</strong>
              <p className="text-sm">
                Click &quot;Workflows&quot; in the sidebar navigation.
              </p>
            </li>
            <li>
              <strong>Create New</strong>
              <p className="text-sm">
                Click the &quot;Create Workflow&quot; button in the top right.
              </p>
            </li>
            <li>
              <strong>Name Your Workflow</strong>
              <p className="text-sm">
                Give it a descriptive name like &quot;Drive Notifications&quot;
                or &quot;Daily Report.&quot;
              </p>
            </li>
            <li>
              <strong>Open the Editor</strong>
              <p className="text-sm">
                Click on your new workflow card to open the visual editor.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Workflow Editor */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">The Workflow Editor</h2>
        <p className="text-muted-foreground mb-4">
          The editor is where you build your workflows visually. Here&apos;s
          what you&apos;ll find:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎨 Canvas (Center)</h3>
            <p className="text-sm text-muted-foreground">
              The main area where your workflow nodes are displayed. Drag to
              pan, scroll to zoom.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">⚙️ Sidebar (Right)</h3>
            <p className="text-sm text-muted-foreground">
              Configure the selected node. Change settings, connect
              integrations, set messages.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔧 Toolbar (Top)</h3>
            <p className="text-sm text-muted-foreground">
              Save your workflow, run it manually, or access additional options.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">➕ Add Nodes</h3>
            <p className="text-sm text-muted-foreground">
              Click the + button between nodes to add new actions to your
              workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Adding Nodes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Adding Nodes</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-4">
          <ol className="list-decimal pl-6 text-muted-foreground space-y-3">
            <li>
              <strong>Click the + Button</strong>
              <p className="text-sm">
                Between any two nodes, click the + icon.
              </p>
            </li>
            <li>
              <strong>Select a Node Type</strong>
              <p className="text-sm">
                Choose from the available nodes (Discord, Gmail, Notion, etc.).
              </p>
            </li>
            <li>
              <strong>Configure the Node</strong>
              <p className="text-sm">
                Click on the node and use the right sidebar to set it up.
              </p>
            </li>
            <li>
              <strong>Connect Integration</strong>
              <p className="text-sm">
                If the node requires an integration, connect it from the
                sidebar.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Configuring Nodes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Configuring Nodes</h2>
        <p className="text-muted-foreground mb-4">
          Each node type has different configuration options:
        </p>

        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">💬 Discord / Slack</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Select channel or webhook</li>
              <li>Write your message (can include variables)</li>
            </ul>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">✉️ Gmail</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Set recipient email(s)</li>
              <li>Write subject and body</li>
            </ul>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">📝 Notion</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Select database</li>
              <li>Set page content</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Running Workflows */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Running Workflows</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            There are two ways to run your workflow:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Manual Run</h3>
              <p className="text-sm text-muted-foreground">
                Click the &quot;Run&quot; button in the toolbar to execute your
                workflow immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Trigger-based</h3>
              <p className="text-sm text-muted-foreground">
                When your trigger fires (e.g., file uploaded to Drive), the
                workflow runs automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/nodes/logic"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Logic Nodes
        </Link>
        <Link
          href="/docs/workflows/examples"
          className="text-primary hover:underline"
        >
          Example Workflows →
        </Link>
      </div>
    </div>
  );
}
