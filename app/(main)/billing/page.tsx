import React from "react";
import Stripe from "stripe";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import BillingDashboard from "./_components/billing-dashboard";
import PageHeader from "@/components/page-header";

type Props = {
  searchParams?: { [key: string]: string | undefined };
};

const Billing = async (props: Props) => {
  const { session_id } = props.searchParams ?? {
    session_id: "",
  };

  const { user } = await validateRequest();

  if (session_id && user) {
    const stripe = new Stripe(process.env.STRIPE_SECRET!, {
      typescript: true,
      apiVersion: "2025-06-30.basil",
    });

    const session = await stripe.checkout.sessions.listLineItems(session_id);

    await db.user.update({
      where: {
        id: Number(user.id),
      },
      data: {
        tier: session.data[0].description,
        credits:
          session.data[0].description == "Unlimited"
            ? "Unlimited"
            : session.data[0].description == "Pro"
            ? "100"
            : "10",
      },
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment methods"
      />
      <div className="flex-1 p-6">
        <BillingDashboard />
      </div>
    </div>
  );
};

export default Billing;
