"use client";
import React from "react";
import { Book, Headphones, Search } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBilling } from "@/providers/billing-provider";
import AuthAccountButton from "@/components/global/auth-account-button";

type InfoBarProps = {
  authSource: "authjs" | "local";
  userEmail: string;
  userName: string;
};

const InfoBar = ({ authSource, userEmail, userName }: InfoBarProps) => {
  const { credits, tier } = useBilling();
  const displayCredits = credits || "10";
  const displayTier = tier || "Free";

  return (
    <div
      className="sticky top-0 z-30 flex flex-col gap-4 bg-white/90 px-4 py-4 backdrop-blur-xl shadow-[rgba(0,0,0,0.08)_0px_1px_0px_0px] sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <span className="ds-pill w-fit">
        Credits
        {displayTier == "Unlimited" ? (
          <span className="font-semibold">Unlimited</span>
        ) : (
          <span className="font-semibold">
            {displayCredits}/{displayTier == "Free" ? "10" : displayTier == "Pro" ? "100" : "Unlimited"}
          </span>
        )}
      </span>
      <span className="flex h-10 w-full items-center gap-2 rounded-md bg-white px-3 shadow-[rgb(235,235,235)_0px_0px_0px_1px] sm:max-w-sm">
        <Search className="h-4 w-4 text-[#808080]" />
        <Input
          placeholder="Quick Search"
          className="h-9 border-none bg-transparent px-0 shadow-none focus-visible:outline-none"
        />
      </span>
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link href="/support" className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:text-[#171717]">
                <Headphones className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Contact Support</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link href="/guide" className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:text-[#171717]">
                <Book className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Guide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AuthAccountButton source={authSource} email={userEmail} name={userName} />
      </div>
    </div>
  );
};

export default InfoBar;
