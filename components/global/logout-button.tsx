"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Sign out from local session
    await fetch("/api/auth/logout", { method: "POST" });

    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      className="text-neutral-500 hover:text-white"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  );
};
