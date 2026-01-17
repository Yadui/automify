import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Site Navigation",
  description: "Navigate the Automify platform - find what you need quickly.",
};

export default function NavigationPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Site Navigation</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Quick guide to finding your way around Automify.
      </p>

      {/* Main Sections */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Main Dashboard Areas</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🏠</span>
              <h3 className="font-semibold">Dashboard</h3>
              <span className="text-xs text-muted-foreground">/dashboard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your home base. See your recent workflows, quick stats, and get
              started quickly.
            </p>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">⚡</span>
              <h3 className="font-semibold">Workflows</h3>
              <span className="text-xs text-muted-foreground">/workflows</span>
            </div>
            <p className="text-sm text-muted-foreground">
              View all your workflows. Create new ones, edit existing, or delete
              old automations.
            </p>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🔌</span>
              <h3 className="font-semibold">Connections</h3>
              <span className="text-xs text-muted-foreground">
                /connections
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your integrations. Connect and disconnect Google, Discord,
              Notion, Slack, etc.
            </p>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">⚙️</span>
              <h3 className="font-semibold">Settings</h3>
              <span className="text-xs text-muted-foreground">/settings</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Account settings, profile picture, theme preferences, and account
              management.
            </p>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">💳</span>
              <h3 className="font-semibold">Billing</h3>
              <span className="text-xs text-muted-foreground">/billing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your subscription, view credits, and upgrade your plan.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Editor */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Workflow Editor</h2>
        <p className="text-muted-foreground mb-4">
          When you open a workflow, you enter the visual editor:
        </p>
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Top Toolbar</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Save:</strong> Save your workflow changes
              </li>
              <li>
                <strong>Run:</strong> Execute the workflow manually
              </li>
              <li>
                <strong>Undo/Redo:</strong> Undo or redo recent changes
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Canvas (Center)</h3>
            <p className="text-sm text-muted-foreground">
              Drag to pan, scroll to zoom. Click nodes to select and configure
              them.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Right Sidebar</h3>
            <p className="text-sm text-muted-foreground">
              Shows configuration for the selected node. Set messages, connect
              integrations, etc.
            </p>
          </div>
        </div>
      </section>

      {/* Header Navigation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Header Navigation</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔍</span>
            <div>
              <h3 className="font-semibold">Quick Search</h3>
              <p className="text-sm text-muted-foreground">
                Search for workflows, connections, and more.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">❓</span>
            <div>
              <h3 className="font-semibold">Help Menu</h3>
              <p className="text-sm text-muted-foreground">
                Access Documentation, Privacy Policy, and Terms of Service.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">👤</span>
            <div>
              <h3 className="font-semibold">Account</h3>
              <p className="text-sm text-muted-foreground">
                View your profile and sign out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold">Dashboard</h3>
            <p className="text-sm text-muted-foreground">/dashboard</p>
          </Link>
          <Link
            href="/workflows"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold">Workflows</h3>
            <p className="text-sm text-muted-foreground">/workflows</p>
          </Link>
          <Link
            href="/connections"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold">Connections</h3>
            <p className="text-sm text-muted-foreground">/connections</p>
          </Link>
          <Link
            href="/settings"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-muted-foreground">/settings</p>
          </Link>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border">
        <Link href="/docs/faq" className="text-primary hover:underline">
          FAQ →
        </Link>
      </div>
    </div>
  );
}
