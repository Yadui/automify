import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  itemColor?: string;
}

const DashboardCard = ({
  title,
  value,
  description,
  icon: Icon,
  itemColor = "text-white",
}: DashboardCardProps) => {
  return (
    <div className="group relative flex flex-col h-full p-6 rounded-3xl border border-neutral-800 bg-black/50 backdrop-blur-xl hover:border-neutral-700 transition-all duration-300 overflow-hidden shadow-xl">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-[#E2CBFF]/10 to-transparent rounded-full blur-2xl group-hover:bg-[#E2CBFF]/20 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
          {title}
        </h3>
        <div className={cn("p-2 rounded-xl bg-neutral-900", itemColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <p className="text-xs text-neutral-500 line-clamp-1">{description}</p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#E2CBFF]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
};

export default DashboardCard;
