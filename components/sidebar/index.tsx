"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { menuOptions } from '@/lib/constant'
import clsx from "clsx";
// import { Separator } from '@/components/ui/separator'
import {
  CirclePlus,
  Database,
  GitBranch,
  LucideMousePointerClick,
} from "lucide-react";
import { menuOptions } from "@/lib/constant";
import { Separator } from "@radix-ui/react-separator";
import { ModeToggle } from "../global/mode-toggle";
// import { ModeToggle } from '../global/mode-toggle'

const MenuOptions = () => {
  const pathName = usePathname();

  return (
    <nav className="sticky top-0 flex h-screen w-20 shrink-0 flex-col items-center justify-between gap-10 overflow-hidden bg-white px-4 py-6 shadow-[rgba(0,0,0,0.08)_1px_0px_0px_0px]">
      <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:bg-[#fafafa]">
        <CirclePlus className="h-5 w-5" />
      </Link>
      <div className="relative flex flex-col items-center justify-center gap-8">
        <TooltipProvider>
          {menuOptions.map((menuItem) => (
            <Tooltip key={menuItem.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={menuItem.href}
                  aria-label={menuItem.name}
                  className={clsx(
                    "group flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#666666] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:bg-[#fafafa] hover:text-[#171717]",
                    {
                      "!bg-[#ebf5ff] !text-[#0068d6] shadow-[rgba(0,104,214,0.18)_0px_0px_0px_1px]":
                        pathName === menuItem.href,
                    }
                  )}
                >
                  <menuItem.Icon className="h-5 w-5" strokeWidth={1.9} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white">
                <p>{menuItem.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        <Separator className="h-px w-8 bg-[#ebebeb]" />
        <div className="flex h-80 flex-col items-center gap-9 overflow-hidden rounded-full bg-[#fafafa] px-2 py-4 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
          <div className="relative rounded-full bg-white p-2 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
            <LucideMousePointerClick className="text-[#171717]" size={18} />
            <div className="absolute -bottom-[30px] left-1/2 h-6 -translate-x-1/2 border-l border-[#ebebeb]" />
          </div>
          <div className="relative rounded-full bg-white p-2 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
            <GitBranch className="text-[#666666]" size={18} />
            <div className="absolute -bottom-[30px] left-1/2 h-6 -translate-x-1/2 border-l border-[#ebebeb]"></div>
          </div>
          <div className="relative rounded-full bg-white p-2 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
            <Database className="text-[#666666]" size={18} />
            <div className="absolute -bottom-[30px] left-1/2 h-6 -translate-x-1/2 border-l border-[#ebebeb]"></div>
          </div>
          <div className="relative rounded-full bg-white p-2 shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
            <GitBranch className="text-[#666666]" size={18} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-8">
        <ModeToggle />
      </div>
    </nav>
  );
};

export default MenuOptions;
