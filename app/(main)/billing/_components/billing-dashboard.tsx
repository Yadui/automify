// billing-dashboard.tsx
"use client";

import { useBilling } from "@/providers/billing-provider";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubscriptionCard } from "./subscription-card";
import CreditTracker from "./credits-tracker";

// Define the product type that matches your Stripe API response
interface StripeProduct {
  id: string;
  nickname: "Free" | "Pro" | "Unlimited";
  description?: string;
  active: boolean;
  default_price?: string;
  unit_amount?: number;
  currency?: string;
}

// Remove unused props parameter if not needed
export default function BillingDashboard() {
  const { credits, tier } = useBilling();
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);

  const onStripeProducts = async () => {
    try {
      const { data } = await axios.get<StripeProduct[]>("/api/payment");
      if (data) {
        setStripeProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch stripe products:", error);
    }
  };

  useEffect(() => {
    onStripeProducts();
  }, []);

  const onPayment = async (id: string) => {
    const { data } = await axios.post<string>(
      "/api/payment",
      {
        priceId: id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.assign(data);
  };

  return (
    <>
      <div className="flex gap-5 p-6">
        <SubscriptionCard
          onPayment={onPayment}
          tier={tier}
          products={stripeProducts}
        />
      </div>
      <CreditTracker tier={tier} credits={parseInt(credits)} />
    </>
  );
}
