"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
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

const Sidebar = () => {
  const pathName = usePathname();

  return (
    <nav className="fixed left-4 pt-10 h-[calc(100vh-2rem)] z-[50]">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className={clsx(
          "h-full flex flex-col items-center justify-between py-8 px-4",
          "bg-black/40 backdrop-blur-2xl border border-neutral-800/50 rounded-[2.5rem]",
          "shadow-[0px_0px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 w-20"
        )}
      >
        <div className="flex flex-col items-center gap-12 w-full">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#E2CBFF] to-[#D1B3FF] rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="relative p-2 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
              <img
                src="../favicon.ico"
                alt="Automify"
                className="w-8 h-8 object-contain"
              />
            </div>
          </Link>

          <Separator className="bg-neutral-800/50 w-full" />
          <ModeToggle />

          {/* Nav Items */}
          <div className="flex flex-col items-center gap-4 w-full h-full pb-36">
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
                            className="absolute inset-0 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                        <div
                          className={clsx(
                            "relative transition-colors duration-300",
                            isActive
                              ? "text-[#E2CBFF]"
                              : "text-neutral-500 group-hover:text-neutral-300"
                          )}
                        >
                          <menuItem.Component selected={isActive} />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={20}
                      className="bg-black/90 text-white border-neutral-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs"
                    >
                      {menuItem.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Sidebar;
