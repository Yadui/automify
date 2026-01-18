"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
    profileImage: string | null;
  };
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group outline-none">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E2CBFF] to-[#D1B3FF] rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
          <Avatar className="h-10 w-10 border-2 border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer">
            <AvatarImage
              src={user.profileImage || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback className="bg-neutral-800 text-neutral-300 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={16}
        className="w-56 bg-black/95 border-neutral-800 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 cursor-pointer text-neutral-300 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
