"use client";

import React from "react";
import { usePathname } from "next/navigation";
import InfoBar from "@/components/infobar";
import Sidebar from "@/components/sidebar";

type Props = {
  children: React.ReactNode;
  authSource: "authjs" | "local";
  userEmail: string;
  userName: string;
};

/** Pattern that matches any workflow editor route. */
const EDITOR_ROUTE = /\/workflows\/editor\//;

/**
 * Client shell for the `(main)` layout.
 *
 * Renders the full Sidebar + InfoBar + padded main area for regular routes.
 * For editor routes it strips away all chrome so EditorCanvas can fill the
 * whole viewport without any wrapping padding, scroll containers, or
 * fixed-width sidebars.
 */
const MainLayoutShell = ({ children, authSource, userEmail, userName }: Props) => {
  const pathname = usePathname();
  const isEditor = EDITOR_ROUTE.test(pathname);

  if (isEditor) {
    return (
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-[#171717]">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <InfoBar authSource={authSource} userEmail={userEmail} userName={userName} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayoutShell;
