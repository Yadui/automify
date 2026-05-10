import InfoBar from "@/components/infobar";
import Sidebar from "@/components/sidebar";
import { BillingProvider } from "@/providers/billing-provider";
import { getAppUser } from "@/lib/app-auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = async (props: Props) => {
  const appUser = await getAppUser();

  if (!appUser) redirect("/sign-in");

  const billing = await db.user.findUnique({
    where: { clerkId: appUser.id },
    select: { credits: true, tier: true },
  });

  return (
    <BillingProvider initialCredits={billing?.credits} initialTier={billing?.tier}>
      <div className="flex h-screen overflow-hidden bg-white text-[#171717]">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <InfoBar authSource={appUser.source} userEmail={appUser.email} userName={appUser.name} />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8">
            {props.children}
          </main>
        </div>
      </div>
    </BillingProvider>
  );
};

export default Layout;
