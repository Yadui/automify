import React from "react";
import db from "@/lib/db";
import DashboardCard from "@/components/global/dashboard-card";
import { Zap, Activity, Link2, CreditCard } from "lucide-react";

interface DashboardStatsProps {
  userId: number;
}

const DashboardStats = async ({ userId }: DashboardStatsProps) => {
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
  );
};

export default DashboardStats;
