import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Node Types",
  description:
    "Complete reference for all Automify node types - triggers, actions, and logic utilities.",
};

export default function NodesOverview() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Node Types</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Nodes are the building blocks of your workflows. Learn about each type
        and how to use them.
      </p>

      {/* Node Categories */}
      <div className="space-y-8">
        {/* Triggers */}
        <section>
          <Link
            href="/docs/nodes/triggers"
            className="block p-6 border border-green-500/30 bg-green-500/5 rounded-lg hover:border-green-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-green-400">⚡ Triggers</h2>
              <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-muted-foreground mb-4">
              Triggers start your workflow when an event occurs. Every workflow
              begins with a trigger.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Google Drive
              </span>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Webhook
              </span>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Schedule
              </span>
            </div>
          </Link>
        </section>

        {/* Actions */}
        <section>
          <Link
            href="/docs/nodes/actions"
            className="block p-6 border border-blue-500/30 bg-blue-500/5 rounded-lg hover:border-blue-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-blue-400">🎯 Actions</h2>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-muted-foreground mb-4">
              Actions perform tasks in your connected services. Send emails,
              post messages, create records, and more.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                Gmail
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                Discord
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                Notion
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                Slack
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                HTTP Request
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                Toast
              </span>
            </div>
          </Link>
        </section>

        {/* Logic & Utilities */}
        <section>
          <Link
            href="/docs/nodes/logic"
            className="block p-6 border border-purple-500/30 bg-purple-500/5 rounded-lg hover:border-purple-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-purple-400">
                🔧 Logic & Utilities
              </h2>
              <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-muted-foreground mb-4">
              Control the flow of your workflow with conditions, delays, and
              data transformations.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                Condition
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                Delay
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                Data Transform
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                KV Storage
              </span>
            </div>
          </Link>
        </section>
      </div>

      {/* Node Anatomy */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-4">Anatomy of a Node</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            Every node in Automify has the following properties:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded shrink-0">
                ID
              </span>
              <span>Unique identifier for the node (auto-generated)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded shrink-0">
                Type
              </span>
              <span>The kind of node (e.g., Discord, Gmail, Condition)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded shrink-0">
                Config
              </span>
              <span>
                Node-specific settings (message content, recipients, etc.)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded shrink-0">
                Output
              </span>
              <span>
                Data produced by the node, available to downstream nodes
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
