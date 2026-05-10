"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { localLogoutAction } from "@/app/(auth)/_actions/local-auth";
import { LogOut, User } from "lucide-react";

type Props = {
  source: "authjs" | "local";
  email: string;
  name?: string | null;
  compact?: boolean;
};

export default function AuthAccountButton({ source, email, name, compact }: Props) {
  const accountName = name?.trim() || email;
  const initial = accountName[0]?.toUpperCase() || "A";
  const triggerClassName = compact
    ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#ebf5ff] text-[#0068d6] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors group-hover:bg-[#dceeff]"
    : "flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors group-hover:text-[#171717]";
  const menuClassName = "invisible absolute right-0 top-full z-50 mt-2 w-64 rounded-md bg-white p-1 opacity-0 shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px,rgba(0,0,0,0.08)_0px_8px_24px] transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100";
  const itemClassName = "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa]";
  const accountSummary = (
    <div className="border-b border-[#ebebeb] px-3 py-3">
      <p className="truncate text-sm font-semibold text-[#171717]">{accountName}</p>
      <p className="mt-0.5 truncate text-xs text-[#808080]">{email}</p>
    </div>
  );
  const triggerContent = compact ? (
    <span className="text-sm font-semibold">{initial}</span>
  ) : (
    <User className="h-4 w-4" />
  );

  if (source === "local") {
    return (
      <div className="group relative">
        <button type="button" className={triggerClassName} aria-label="Account menu">
          {triggerContent}
        </button>
        <div className={menuClassName}>
          {accountSummary}
          <form action={localLogoutAction}>
            <button type="submit" className={itemClassName}>
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <button type="button" className={triggerClassName} aria-label="Account menu">
        {triggerContent}
      </button>
      <div className={menuClassName}>
        {accountSummary}
        <button
          type="button"
          className={itemClassName}
          onClick={() => void signOut({ callbackUrl: "/sign-in" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}