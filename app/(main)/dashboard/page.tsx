import React from "react";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import DashboardCard from "@/components/global/dashboard-card";
import {
  Plus,
  Zap,
  Activity,
  Link2,
  CreditCard,
  BookOpen,
  Settings2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";

const DashboardPage = async () => {
  const { user } = await validateRequest();

  if (!user) return null;
  const userId = Number(user.id);

  // Fetch Stats
  let totalWorkflows = 0;
  let activeWorkflows = 0;
  let totalConnections = 0;

  try {
    const [tw, aw, tc] = await Promise.all([
      db.workflow.count({ where: { userId } }),
      db.workflow.count({ where: { userId, publish: true } }),
      db.connection.count({ where: { userId } }),
    ]);
    totalWorkflows = tw;
    activeWorkflows = aw;
    totalConnections = tc;
  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
  }

  const stats = [
    {
      title: "Total Workflows",
      value: totalWorkflows,
      description: "Automations created",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      title: "Active Flows",
      value: activeWorkflows,
      description: "Currently running",
      icon: Activity,
      color: "text-green-400",
    },
    {
      title: "Connected Apps",
      value: totalConnections,
      description: "Active integrations",
      icon: Link2,
      color: "text-blue-400",
    },
    {
      title: "Monthly Tasks",
      value: "0",
      description: "Current billing cycle",
      icon: CreditCard,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Dashboard"
        description="Overview of your automation platform"
      >
        <Link href="/workflows">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        </Link>
      </PageHeader>

      <div className="relative flex-1 overflow-visible">
        <BackgroundLines className="absolute inset-0 z-0 opacity-20">
          <div />
        </BackgroundLines>

        <div className="relative z-10 p-6 sm:p-8 space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {stats.map((stat) => (
              <DashboardCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                itemColor={stat.color}
              />
            ))}
          </div>

          {/* Quick Actions & Recent Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/workflows" className="group">
                  <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/50 hover:border-neutral-700 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <span className="font-semibold text-white">
                        Create New Flow
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </div>
                </Link>
                <Link href="/settings" className="group">
                  <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/50 hover:border-neutral-700 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                        <Settings2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="font-semibold text-white">
                        Configure Apps
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Resources
              </h2>
              <div className="p-8 rounded-3xl border border-neutral-900 bg-gradient-to-br from-neutral-950/50 to-neutral-900/10 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-[#E2CBFF]/10">
                    <BookOpen className="w-6 h-6 text-[#E2CBFF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Documentation</h3>
                    <p className="text-sm text-neutral-500">
                      Learn how to build powerful automations
                    </p>
                  </div>
                </div>
                <Button
                  variant="link"
                  className="text-[#E2CBFF] p-0 h-auto font-semibold gap-1 group"
                >
                  View full guide
                  <Plus className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
