import React from "react";
import Stripe from "stripe";
import BillingDashboard from "./billing-dashboard";
import { onAssignLicense } from "../_actions/license-actions";
import db from "@/lib/db";

interface BillingContentProps {
  userId: number;
  session_id?: string;
}

const BillingContent = async ({ userId, session_id }: BillingContentProps) => {
  if (session_id) {
    const stripe = new Stripe(process.env.STRIPE_SECRET!, {
      typescript: true,
      apiVersion: "2024-12-18.acacia",
    });

    const session = await stripe.checkout.sessions.listLineItems(session_id);
    const tier = session.data[0].description;

    if (tier) {
      await onAssignLicense(userId, tier);
    }
  }

  const userWithLicenses = await db.user.findUnique({
    where: { id: userId },
    include: {
      licenses: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return <BillingDashboard licenses={userWithLicenses?.licenses || []} />;
};

export default BillingContent;
