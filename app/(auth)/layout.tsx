"use client";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <div
      className="absolute inset-0 h-full w-full flex items-center justify-center px-5 py-32"
      style={{
        background:
          "radial-gradient(150% 150% at 50% 0%, #222 25%, #667 75%, #889 100%)",
      }}
    >
      {children}
    </div>
  );
};

export default Layout;
