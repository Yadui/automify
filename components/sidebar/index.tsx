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

interface SidebarProps {
  // Add actual props here or use 'object'/'unknown' if needed
}

const MenuOptions = (props: SidebarProps) => {
  const pathName = usePathname();

  return (
    <nav className="dark:bg-black h-screen overflow-hidden justify-between flex items-center flex-col gap-10 py-6 px-4 w-20 z-1 ">
      <span className="flex items-center justify-center rounded-full bg-muted p-2 cursor-pointer hover:transform:{rotateY(180deg)}">
        <CirclePlus />
      </span>
      <div className="flex items-center justify-center flex-col gap-8 relative ">
        <TooltipProvider>
          {menuOptions.map((menuItem) => (
            <ul key={menuItem.name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <li>
                    <Link
                      href={menuItem.href}
                      className={clsx(
                        "group h-8 w-8 flex items-center justify-center  scale-[1.5] rounded-lg p-[3px]  cursor-pointer",
                        {
                          "dark:bg-[#2F006B] bg-[#EEE0FF] ":
                            pathName === menuItem.href,
                        }
                      )}
                    >
                      <menuItem.Component
                        selected={pathName === menuItem.href}
                      />
                    </Link>
                  </li>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-black/10 backdrop-blur-xl"
                >
                  <p>{menuItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </ul>
          ))}
        </TooltipProvider>
        <Separator />
        <div className="flex items-center flex-col gap-9 dark:bg-[#353346]/30 py-4 px-2 rounded-full h-80 overflow-hidden border-[1px]">
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <LucideMousePointerClick className="dark:text-white" size={18} />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <GitBranch className="text-muted-foreground" size={18} />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]"></div>
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <Database className="text-muted-foreground" size={18} />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]"></div>
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <GitBranch className="text-muted-foreground" size={18} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col gap-8 ">
        <ModeToggle />
      </div>
    </nav>
  );
};

export default MenuOptions;
