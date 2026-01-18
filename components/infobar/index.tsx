"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Book,
  Headphones,
  Search,
  FileText,
  Shield,
  HelpCircle,
  User2,
  LogOut,
  Settings,
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
import { useBilling } from "@/providers/billing-provider";
import { onPaymentDetails } from "@/app/(main)/billing/_actions/payment-connection";
import { getUserInfo } from "@/app/(main)/_actions/user-info";

interface InfoBarProps {}

const InfoBar = (props: InfoBarProps) => {
  const router = useRouter();
  const { credits, tier, setCredits, setTier } = useBilling();
  const [userName, setUserName] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  // Timeout refs for debounced close
  const userMenuTimeout = useRef<NodeJS.Timeout | null>(null);
  const helpMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  const onGetPayment = async () => {
    const response = await onPaymentDetails();
    if (response) {
      setTier(response.tier!);
      setCredits(response.credits!);
    }
  };

  const fetchUser = async () => {
    const user = await getUserInfo();
    if (user) {
      setUserName(user.name || user.email || "User");
    }
  };

  useEffect(() => {
    onGetPayment();
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  };

  // Help menu hover handlers with debounce
  const handleHelpMenuEnter = () => {
    if (helpMenuTimeout.current) {
      clearTimeout(helpMenuTimeout.current);
      helpMenuTimeout.current = null;
    }
    setIsHelpMenuOpen(true);
  };

  const handleHelpMenuLeave = () => {
    helpMenuTimeout.current = setTimeout(() => {
      setIsHelpMenuOpen(false);
    }, 150);
  };

  // User menu hover handlers with debounce
  const handleUserMenuEnter = () => {
    if (userMenuTimeout.current) {
      clearTimeout(userMenuTimeout.current);
      userMenuTimeout.current = null;
    }
    setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimeout.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150);
  };

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

      {/* Help Menu Dropdown - Hover controlled */}
      <div
        onMouseEnter={handleHelpMenuEnter}
        onMouseLeave={handleHelpMenuLeave}
      >
        <DropdownMenu open={isHelpMenuOpen} onOpenChange={setIsHelpMenuOpen}>
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
      </div>

      {/* User Menu - Hover controlled */}
      <div
        onMouseEnter={handleUserMenuEnter}
        onMouseLeave={handleUserMenuLeave}
      >
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <User2 className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                {userName || "User"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default InfoBar;
