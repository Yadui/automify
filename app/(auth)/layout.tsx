"use client";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-5 py-16"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
      }}
    >
      {children}
    </div>
  );
};

export default Layout;
