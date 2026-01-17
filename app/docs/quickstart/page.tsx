import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Quick Start Guide",
  description:
    "Get started with Automify in 5 minutes - Create your first automated workflow.",
};

export default function QuickStartPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Quick Start Guide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create your first automated workflow in under 5 minutes.
      </p>

      {/* Progress Steps */}
      <div className="space-y-8">
        {/* Step 1 */}
        <section className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">
                Create Your Account
              </h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  Go to the{" "}
                  <Link
                    href="/sign-in"
                    className="text-primary hover:underline"
                  >
                    Sign In
                  </Link>{" "}
                  page
                </li>
                <li>
                  Click &quot;Sign Up&quot; and enter your email, or sign in
                  with GitHub
                </li>
                <li>Verify your email if prompted</li>
                <li>You&apos;ll be redirected to your Dashboard</li>
              </ol>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                Takes about 1 minute
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">
                Connect an Integration
              </h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  Click <strong>Connections</strong> in the sidebar
                </li>
                <li>
                  Find the service you want to connect (e.g., Google, Discord)
                </li>
                <li>
                  Click <strong>Connect</strong> and authorize Automify
                </li>
                <li>A green checkmark appears when connected</li>
              </ol>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                Takes about 2 minutes per integration
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">Create a Workflow</h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  Click <strong>Workflows</strong> in the sidebar
                </li>
                <li>
                  Click <strong>Create Workflow</strong>
                </li>
                <li>
                  Give your workflow a name (e.g., &quot;Drive
                  Notification&quot;)
                </li>
                <li>Click the workflow card to open the editor</li>
              </ol>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                Takes about 30 seconds
              </div>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">
                Build Your Workflow
              </h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  Your workflow starts with a <strong>Trigger</strong> node
                  (already added)
                </li>
                <li>
                  Click the <strong>+</strong> button to add action nodes
                </li>
                <li>
                  Select a node type from the sidebar (e.g., Discord, Gmail)
                </li>
                <li>Click on each node to configure it in the right panel</li>
                <li>
                  Connect integrations, set messages, and configure triggers
                </li>
              </ol>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                Takes 2-5 minutes depending on complexity
              </div>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="bg-muted/30 border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
              5
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">Save and Run</h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  Click <strong>Save</strong> in the top toolbar to save your
                  workflow
                </li>
                <li>
                  Click <strong>Run</strong> to test your workflow
                </li>
                <li>
                  Watch the nodes execute and check for success/error messages
                </li>
                <li>Your workflow is now active!</li>
              </ol>
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                That&apos;s it! Your first workflow is complete.
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Next Steps */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-4">What&apos;s Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs/nodes"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Explore Nodes</h3>
            <p className="text-sm text-muted-foreground">
              Learn about all available node types
            </p>
          </Link>
          <Link
            href="/docs/workflows/examples"
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold mb-1">Example Workflows</h3>
            <p className="text-sm text-muted-foreground">
              Get inspired by pre-built templates
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
