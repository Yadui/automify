"use client";
import InfoBar from "@/components/infobar";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  const pathname = usePathname();
  const isEditor = pathname.includes("/editor/");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Full-width InfoBar at the top */}
      {!isEditor && <InfoBar />}

      {/* Sidebar + Content below the InfoBar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className={
            isEditor
              ? "flex-1 overflow-hidden ml-28"
              : "flex-1 overflow-auto ml-28"
          }
        >
          {props.children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
