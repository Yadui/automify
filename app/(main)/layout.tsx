"use client";
import InfoBar from "@/components/infobar";
import Sidebar from "@/components/sidebar";
import SupportChatbot from "@/components/global/support-chatbot"; // Import Chatbot
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getUserInfo } from "./_actions/user-info";

type Props = { children: React.ReactNode };

type UserInfo = {
  name: string | null;
  email: string;
  profileImage: string | null;
};

const Layout = (props: Props) => {
  const pathname = usePathname();
  const isEditor = pathname.includes("/editor/");
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getUserInfo();
      if (response) {
        setUser({
          name: response.name || null,
          email: response.email || "",
          profileImage: response.profileImage || null,
        });
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Full-width InfoBar at the top */}
      {!isEditor && <InfoBar />}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user || undefined} />
        <main
          className={
            isEditor
              ? "flex-1 overflow-hidden ml-28"
              : "flex-1 overflow-auto ml-28"
          }
        >
          {props.children}
        </main>
        <SupportChatbot />
      </div>
    </div>
  );
};

export default Layout;
