// billing-dashboard.tsx
"use client";

import { useBilling } from "@/providers/billing-provider";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubscriptionCard } from "./subscription-card";
import LicenseHistory from "./license-history";
import { Zap, Crown, Sparkles } from "lucide-react";

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

interface BillingDashboardProps {
  licenses: any[];
}

// Static plans as fallback
const STATIC_PLANS: StripeProduct[] = [
  { id: "free", nickname: "Free", active: true },
  { id: "pro", nickname: "Pro", active: true },
  { id: "unlimited", nickname: "Unlimited", active: true },
];

export default function BillingDashboard({ licenses }: BillingDashboardProps) {
  const { credits, tier } = useBilling();
  const [stripeProducts, setStripeProducts] =
    useState<StripeProduct[]>(STATIC_PLANS);

  const onStripeProducts = async () => {
    try {
      const { data } = await axios.get<StripeProduct[]>("/api/payment");
      if (data && data.length > 0) {
        // Map prices to products with nicknames
        const mappedProducts = data.map((price: any) => ({
          id: price.id,
          nickname: price.nickname || price.product?.name || "Unknown",
          active: price.active,
        }));
        if (mappedProducts.length > 0) {
          setStripeProducts(mappedProducts as StripeProduct[]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch stripe products:", error);
      // Keep static plans on error
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
      },
    );
    window.location.assign(data);
  };

  const getTierIcon = () => {
    switch (tier) {
      case "Unlimited":
        return <Crown className="w-6 h-6" />;
      case "Pro":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Current Plan Overview */}
      <div className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Current Plan
            </h2>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {getTierIcon()}
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent italic font-mono uppercase">
                {tier}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                ACTIVE
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-muted-foreground">
              Remaining Credits
            </span>
            <span className="text-5xl font-mono font-bold">
              {tier === "Unlimited" ? "∞" : credits.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold italic font-mono uppercase">
            Upgrade your plan
          </h2>
          <div className="h-[1px] flex-1 bg-border" />
        </div>
        <SubscriptionCard
          onPayment={onPayment}
          tier={tier}
          products={stripeProducts}
        />
      </div>

      {/* License History */}
      <LicenseHistory licenses={licenses} />
    </div>
  );
}
