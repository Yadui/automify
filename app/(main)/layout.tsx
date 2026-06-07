import MainLayoutShell from "@/components/main-layout-shell";
import { BillingProvider } from "@/providers/billing-provider";
import { getAppUser } from "@/lib/app-auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = { children: React.ReactNode };

const Layout = async (props: Props) => {
  const appUser = await getAppUser();

  if (!appUser) redirect("/sign-in");

  // Billing data is fetched client-side in BillingProvider (useEffect) so this
  // layout no longer blocks navigation on an extra DB round-trip.
  return (
    <BillingProvider>
      <MainLayoutShell
        authSource={appUser.source}
        userEmail={appUser.email}
        userName={appUser.name}
      >
        {props.children}
      </MainLayoutShell>
    </BillingProvider>
  );
};

export default Layout;
