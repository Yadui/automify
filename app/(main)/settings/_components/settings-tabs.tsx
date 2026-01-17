"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Link2,
  Shield,
  Download,
  Trash2,
  ExternalLink,
  AlertCircle,
  Loader2,
  Undo2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  exportUserData,
  scheduleAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus,
} from "../_actions/account-actions";

interface Connection {
  provider: string;
  createdAt: Date;
}

interface SettingsTabsProps {
  profileContent: React.ReactNode;
  connections: Connection[];
  userEmail: string;
}

export default function SettingsTabs({
  profileContent,
  connections,
  userEmail,
}: SettingsTabsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<{
    scheduled: boolean;
    hoursRemaining?: number;
    deletionDate?: string;
  }>({ scheduled: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const connectionLabels: Record<string, { name: string; icon: string }> = {
    google: { name: "Google", icon: "/googleDrive.png" },
    discord: { name: "Discord", icon: "/discord.png" },
    notion: { name: "Notion", icon: "/notion.png" },
    slack: { name: "Slack", icon: "/slack.png" },
    github: { name: "GitHub", icon: "/github.svg" },
  };

  // Check deletion status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const status = await getDeletionStatus();
      setDeletionStatus(status);
    };
    checkStatus();
  }, []);

  // Handle data export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportUserData();
      if (result.success && result.data) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || "automify-export.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await scheduleAccountDeletion();
      if (result.success) {
        setDeletionStatus({
          scheduled: true,
          hoursRemaining: 48,
          deletionDate: result.deletionDate,
        });
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Deletion scheduling failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel deletion
  const handleCancelDeletion = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelAccountDeletion();
      if (result.success) {
        setDeletionStatus({ scheduled: false });
      }
    } catch (error) {
      console.error("Cancel deletion failed:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
        <TabsTrigger value="profile" className="gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="connections" className="gap-2">
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">Connections</span>
        </TabsTrigger>
        <TabsTrigger value="privacy" className="gap-2">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Privacy</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <div className="max-w-2xl">{profileContent}</div>
      </TabsContent>

      {/* CONNECTIONS TAB */}
      <TabsContent value="connections" className="space-y-6">
        <div className="max-w-2xl">
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="text-xl font-semibold">Connected Apps</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your connected third-party services. Disconnecting
              an app immediately revokes Automify&apos;s access.
            </p>
          </div>

          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((conn, index) => {
                const label = connectionLabels[conn.provider] || {
                  name: conn.provider,
                  icon: "",
                };
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {label.icon && (
                        <img
                          src={label.icon}
                          alt={label.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <div>
                        <p className="font-medium">{label.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Connected{" "}
                          {new Date(conn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                        Active
                      </span>
                      <Link href="/connections">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Disconnect
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground pt-2">
                Disconnecting removes stored access tokens immediately. You can
                reconnect at any time from the Connections page.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No apps connected</p>
              <p className="text-sm mt-1">
                Connect apps to enable workflow automations
              </p>
              <Link href="/connections">
                <Button variant="outline" size="sm" className="mt-4">
                  Connect Apps
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <Link href="/connections">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Go to Connections
              </Button>
            </Link>
          </div>
        </div>
      </TabsContent>

      {/* PRIVACY & DATA TAB */}
      <TabsContent value="privacy" className="space-y-6">
        <div className="max-w-2xl">
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="text-xl font-semibold">Privacy & Data</h2>
            <p className="text-sm text-muted-foreground">
              View your account data, export options, and privacy controls
            </p>
          </div>

          {/* Your Data Section */}
          <section className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Your Data</h3>
            <p className="text-sm text-muted-foreground">
              Information stored in your Automify account.
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                  Account Email
                </p>
                <p className="font-medium">{userEmail}</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                  Workflows
                </p>
                <p className="font-medium">
                  Your workflow configurations and settings
                </p>
              </div>
            </div>
          </section>

          {/* Export Your Data Section */}
          <section className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Export Your Data</h3>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">
                Download a copy of your Automify data in JSON format. This
                includes:
              </p>
              <ul className="text-sm text-muted-foreground pl-4 space-y-1 mb-3">
                <li>• Account profile information</li>
                <li>• Workflow configurations and node settings</li>
                <li>• Connection metadata (provider names, dates)</li>
              </ul>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Export does not include OAuth tokens, API secrets, third-party
                  content, or execution logs. Data stored by connected services
                  must be exported from those services directly.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? "Exporting..." : "Export Data (JSON)"}
              </Button>
            </div>
          </section>

          {/* Privacy Rights Section */}
          <section className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Privacy Rights</h3>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">
                Depending on your location, you may have rights including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>• Access to your personal data</li>
                <li>• Correction of inaccurate data</li>
                <li>• Deletion of your data</li>
                <li>• Data portability</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                You can manage most data through this settings page. For
                additional requests, contact{" "}
                <a
                  href="mailto:privacy@automify.app"
                  className="text-primary hover:underline"
                >
                  privacy@automify.app
                </a>
              </p>
            </div>
          </section>

          {/* Legal Documents Section */}
          <section className="space-y-4 mb-8">
            <h3 className="text-lg font-medium">Legal Documents</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Review our policies on data handling and service terms.
            </p>
            <div className="grid gap-3">
              <Link
                href="/privacy"
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Privacy Policy</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link
                href="/terms"
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Terms of Service</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* DELETE ACCOUNT SECTION */}
          <section className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-lg font-medium text-red-400">Delete Account</h3>

            {deletionStatus.scheduled ? (
              // Deletion scheduled - show cancellation option
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3 mb-4">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-500">
                      Account Deletion Scheduled
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your account is scheduled for deletion in{" "}
                      <strong>{deletionStatus.hoursRemaining} hours</strong>.
                      All data will be permanently removed after this period.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  You can cancel this action and keep your account active.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCancelDeletion}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Undo2 className="w-4 h-4" />
                  )}
                  {isCancelling ? "Cancelling..." : "Cancel Deletion"}
                </Button>
              </div>
            ) : showDeleteConfirm ? (
              // Confirmation step
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <p className="text-sm font-medium text-red-400 mb-3">
                  Are you sure you want to delete your account?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  You will have <strong>48 hours</strong> to cancel this action.
                  After that, all your data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {isDeleting ? "Scheduling..." : "Yes, Delete My Account"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // Initial state
              <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <p className="text-sm text-muted-foreground mb-3">
                  Deleting your account will:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4 mb-4">
                  <li>• Permanently delete all workflows and configurations</li>
                  <li>• Revoke access to all connected integrations</li>
                  <li>• Remove your account data from Automify</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-4">
                  After requesting deletion, you&apos;ll have{" "}
                  <strong>48 hours</strong> to cancel. Data stored by
                  third-party services you connected will not be affected.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </div>
            )}
          </section>
        </div>
      </TabsContent>
    </Tabs>
  );
}
