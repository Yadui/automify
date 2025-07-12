import InfoBar from "@/components/infobar";
import Sidebar from "@/components/sidebar";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <InfoBar />
        <main className="flex-1 overflow-auto p-4">{props.children}</main>
      </div>
    </div>
  );
};

export default Layout;
