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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden ml-28">
        {!isEditor && <InfoBar />}
        <main
          className={
            isEditor ? "flex-1 overflow-hidden" : "flex-1 overflow-auto p-4"
          }
        >
          {props.children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
