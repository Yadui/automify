"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuOptions } from "@/lib/constant";
import clsx from "clsx";

export const MobileNav = () => {
  const pathName = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-[100] flex items-center justify-around px-4 lg:hidden">
      {menuOptions.map((menuItem) => {
        const isActive = pathName === menuItem.href;
        return (
          <Link
            key={menuItem.name}
            href={menuItem.href}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 transition-colors relative",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <menuItem.Component className="w-5 h-5" />
            <span className="text-[10px] font-medium">{menuItem.name}</span>
            {isActive && (
              <div className="absolute -top-2 w-1 h-1 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
