"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  Book,
  Headphones,
  Search,
  FileText,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "../global/logout-button";
import { useBilling } from "@/providers/billing-provider";
import { onPaymentDetails } from "@/app/(main)/billing/_actions/payment-connection";

interface InfoBarProps {}

const InfoBar = (props: InfoBarProps) => {
  const { credits, tier, setCredits, setTier } = useBilling();

  const onGetPayment = async () => {
    const response = await onPaymentDetails();
    if (response) {
      setTier(response.tier!);
      setCredits(response.credits!);
    }
  };

  useEffect(() => {
    onGetPayment();
  }, [onGetPayment]);

  return (
    <div
      className="sticky flex flex-row justify-end gap-6 items-center py-4 w-a dark:bg-black/40 backdrop-blur-lg right-0  z-3 
    border-b bg-background/50 p-6 text"
    >
      <span className="flex items-center gap-2 font-bold">
        <p className="text-sm font-light text-gray-300">Credits</p>
        {tier == "Unlimited" ? (
          <span>Unlimited</span>
        ) : (
          <span>
            {credits}/{tier == "Free" ? "10" : tier == "Pro" && "100"}
          </span>
        )}
      </span>
      <span className="flex items-center rounded-full bg-muted px-4">
        <Search />
        <Input
          placeholder="Quick Search"
          className="border-none bg-transparent"
        />
      </span>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Headphones />
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact Support</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Help Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/docs"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Book className="w-4 h-4" />
              Documentation
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/privacy"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/terms"
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-4">
        <LogoutButton />
      </div>
    </div>
  );
};

export default InfoBar;
