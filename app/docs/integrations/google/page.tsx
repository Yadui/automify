import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google Integration",
  description: "Set up Google (Gmail & Drive) integration with Automify.",
};

export default function GoogleIntegrationPage() {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/docs/integrations" className="hover:text-foreground">
          Integrations
        </Link>{" "}
        / Google
      </div>
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/googleDrive.png"
          alt="Google"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-4xl font-bold">Google Integration</h1>
      </div>
      <p className="text-xl text-muted-foreground mb-8">
        Connect Gmail and Google Drive to send emails and trigger workflows on
        file changes.
      </p>

      {/* What You Get */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">What You Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/googleDrive.png"
                alt="Google Drive"
                className="w-6 h-6 object-contain"
              />
              <h3 className="font-semibold">Google Drive (Trigger)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Start workflows when files are added, modified, or deleted in your
              Drive.
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/gmailLogo.png"
                alt="Gmail"
                className="w-6 h-6 object-contain"
              />
              <h3 className="font-semibold">Gmail (Action)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Send emails automatically from your Gmail account.
            </p>
          </div>
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
                Click &quot;Connections&quot; in the left sidebar.
              </p>
            </li>
            <li>
              <strong>Find Google</strong>
              <p className="text-sm">
                Locate the Google card in the connections list.
              </p>
            </li>
            <li>
              <strong>Click Connect</strong>
              <p className="text-sm">Click the &quot;Connect&quot; button.</p>
            </li>
            <li>
              <strong>Sign in to Google</strong>
              <p className="text-sm">
                You&apos;ll be redirected to Google. Sign in with your account.
              </p>
            </li>
            <li>
              <strong>Grant Permissions</strong>
              <p className="text-sm">
                Review and approve the permissions Automify needs.
              </p>
            </li>
            <li>
              <strong>Done!</strong>
              <p className="text-sm">
                You&apos;ll be redirected back. A green checkmark confirms the
                connection.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Permissions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Permissions Requested</h2>
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Send email on your behalf</strong>
                <p className="text-sm">
                  Required for Gmail action node to send emails.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>See and download your Google Drive files</strong>
                <p className="text-sm">
                  Required to detect file changes for Drive triggers.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>View your email address</strong>
                <p className="text-sm">Used to identify your account.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">File Upload Notification</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Notify your team when a new file is added to Drive:
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-green-500/20 rounded">
                Drive Trigger
              </span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-500/20 rounded">
                Discord/Slack
              </span>
            </div>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Automated Email Reports</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Send email notifications when data changes:
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-green-500/20 rounded">
                Webhook Trigger
              </span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-500/20 rounded">Gmail</span>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Connection Failed?</h3>
            <p className="text-sm text-muted-foreground">
              Make sure you&apos;re signed into the correct Google account. If
              issues persist, try disconnecting and reconnecting.
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Emails Not Sending?</h3>
            <p className="text-sm text-muted-foreground">
              Check that the Gmail scope was approved during authorization. You
              may need to reconnect if permissions weren&apos;t fully granted.
            </p>
          </div>
        </div>
      </section>

      {/* Next */}
      <div className="mt-8 pt-8 border-t border-border flex justify-between">
        <Link
          href="/docs/integrations"
          className="text-muted-foreground hover:text-foreground"
        >
          ← All Integrations
        </Link>
        <Link
          href="/docs/integrations/discord"
          className="text-primary hover:underline"
        >
          Discord →
        </Link>
      </div>
    </div>
  );
}
