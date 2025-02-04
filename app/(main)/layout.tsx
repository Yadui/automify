import InfoBar from "@/components/infobar";
import Sidebar from "@/components/sidebar";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <div className="flex overflow-hidden h-screen">
      <Sidebar />
      <div className="w-full top-10">
        <InfoBar />
        {props.children}
      </div>
    </div>
  );
};

export default Layout;
