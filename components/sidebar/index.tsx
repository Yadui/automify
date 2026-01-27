"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { menuOptions } from "@/lib/constant";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  CirclePlus,
  Database,
  GitBranch,
  LucideMousePointerClick,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "../global/mode-toggle";
import UserMenu from "../global/user-menu";

interface SidebarProps {
  user?: {
    name: string | null;
    email: string;
    profileImage: string | null;
  };
}

const Sidebar = ({ user }: SidebarProps) => {
  const pathName = usePathname();

  return (
    <nav className="fixed left-4 pt-10 h-[90vh] z-[50]">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className={clsx(
          "h-full flex flex-col items-center justify-between py-8 px-4",
          "bg-card/40 backdrop-blur-2xl border border-border",
          "shadow-xl transition-all duration-500 w-20",
        )}
      >
        <div className="flex flex-col items-center gap-12 w-full flex-1">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="relative p-2 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden hover:bg-accent transition-colors">
              <img
                src="../favicon.ico"
                alt="Automify"
                className="w-8 h-8 object-contain"
              />
            </div>
          </Link>

          <Separator className="bg-border w-full" />
          <ModeToggle />

          {/* Nav Items */}
          <div className="flex flex-col items-center gap-4 w-full">
            <TooltipProvider>
              {menuOptions.map((menuItem) => {
                const isActive = pathName === menuItem.href;
                return (
                  <Tooltip key={menuItem.name} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={menuItem.href}
                        prefetch={true}
                        className="relative group p-3 rounded-2xl transition-all"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-accent border border-primary/20 rounded-2xl"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.3,
                            }}
                          />
                        )}
                        <div
                          className={clsx(
                            "relative transition-colors duration-300",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          <menuItem.Component className="w-6 h-6 stroke-[1.5]" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={20}
                      className="bg-popover text-popover-foreground border-border backdrop-blur-md px-3 py-1.5 rounded-lg text-xs"
                    >
                      {menuItem.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </div>

        {/* User Menu at Bottom */}
        {user && (
          <div className="mt-auto pt-4">
            <Separator className="bg-border w-full mb-4" />
            <UserMenu user={user} />
          </div>
        )}
      </motion.div>
    </nav>
  );
};

export default Sidebar;
