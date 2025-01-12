"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <div className="relative flex items-center justify-center h-screen w-full p-4 sm:p-8">
      <BackgroundGradient className="absolute inset-0 -z-10" />
      {children}
    </div>
  );
};

export default Layout;
