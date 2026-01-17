import { Metadata } from "next";
import Link from "next/link";
import { Zap, Link2, Workflow, BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Complete guide to using Automify - Learn how to set up workflows, connect integrations, and automate your tasks.",
};

export default function DocsHome() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Automify Documentation</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Everything you need to know about building powerful automations.
      </p>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Link
          href="/docs/quickstart"
          className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors group bg-muted/20"
        >
          <Zap className="w-8 h-8 mb-3 text-primary" />
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            Quick Start Guide
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get up and running in 5 minutes. Create your account, connect
            integrations, and build your first workflow.
          </p>
          <span className="text-sm text-primary flex items-center gap-1">
            Get Started <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          href="/docs/nodes"
          className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors group bg-muted/20"
        >
          <Workflow className="w-8 h-8 mb-3 text-primary" />
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            Node Reference
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Learn about all available nodes - triggers, actions, and logic
            utilities for your workflows.
          </p>
          <span className="text-sm text-primary flex items-center gap-1">
            Explore Nodes <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          href="/docs/integrations"
          className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors group bg-muted/20"
        >
          <Link2 className="w-8 h-8 mb-3 text-primary" />
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            Integrations
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Connect with Google, Discord, Notion, Slack, and more. Step-by-step
            setup guides.
          </p>
          <span className="text-sm text-primary flex items-center gap-1">
            View Integrations <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          href="/docs/workflows/examples"
          className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors group bg-muted/20"
        >
          <BookOpen className="w-8 h-8 mb-3 text-primary" />
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            Example Workflows
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Ready-to-use workflow templates and examples to help you get started
            quickly.
          </p>
          <span className="text-sm text-primary flex items-center gap-1">
            Browse Examples <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What is Automify?</h2>
        <p className="text-muted-foreground mb-4">
          Automify is a visual workflow automation platform that lets you
          connect your favorite apps and services to automate repetitive tasks.
          With our drag-and-drop editor, you can:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            Create automated workflows triggered by events (file uploads,
            webhooks, schedules)
          </li>
          <li>
            Send emails, post messages to Discord/Slack, create Notion pages
            automatically
          </li>
          <li>Pass data between nodes using variables</li>
          <li>Add logic with conditions, delays, and data transformations</li>
        </ul>
      </section>

      {/* Key Concepts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Key Concepts</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔗 Workflows</h3>
            <p className="text-sm text-muted-foreground">
              A workflow is a sequence of connected nodes that execute in order.
              Each workflow starts with a trigger and contains one or more
              action nodes.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">⚡ Nodes</h3>
            <p className="text-sm text-muted-foreground">
              Nodes are the building blocks of workflows. There are three types:
              Triggers (start the workflow), Actions (perform tasks), and Logic
              (control flow).
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔌 Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Connect external services like Google, Discord, Notion, and Slack
              to use them in your workflows. Integrations are managed in your
              Connections page.
            </p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📊 Variables</h3>
            <p className="text-sm text-muted-foreground">
              Pass data between nodes using variables. Reference outputs from
              previous nodes using the {"{{NodeName.field}}"} syntax.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Ready to get started?</h2>
        <p className="text-muted-foreground mb-4">
          Follow our quick start guide to create your first workflow in under 5
          minutes.
        </p>
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Start the Tutorial <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
