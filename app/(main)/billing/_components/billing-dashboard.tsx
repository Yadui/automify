// billing-dashboard.tsx
"use client";

import { useBilling } from "@/providers/billing-provider";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubscriptionCard } from "./subscription-card";
import CreditTracker from "./credits-tracker";
import { isPaidBillingPlanName, type BillingPlanName, type PaidBillingPlanName } from "@/lib/pricing-plans";

interface BillingProduct {
  id: string;
  nickname: BillingPlanName;
  description?: string;
  active: boolean;
  default_price?: string;
  unit_amount?: number;
  currency?: string;
}

type RazorpayOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: PaidBillingPlanName;
};

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const loadRazorpayCheckout = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BillingDashboard() {
  const { credits, tier, setCredits, setTier } = useBilling();
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [payingPlan, setPayingPlan] = useState<BillingPlanName | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const onBillingProducts = async () => {
    try {
      const { data } = await axios.get<BillingProduct[]>("/api/payment");
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch billing products:", error);
    }
  };

  useEffect(() => {
    onBillingProducts();
  }, []);

  const onPayment = async (plan: BillingPlanName) => {
    if (!isPaidBillingPlanName(plan)) return;

    setPayingPlan(plan);
    setPaymentError(null);
    const checkoutLoaded = await loadRazorpayCheckout();
    if (!checkoutLoaded || !window.Razorpay) {
      setPayingPlan(null);
      setPaymentError("Razorpay checkout could not load. Please try again.");
      console.error("Razorpay checkout failed to load.");
      return;
    }

    try {
      const { data } = await axios.post<RazorpayOrderResponse>(
        "/api/payment",
        { plan },
        { headers: { "Content-Type": "application/json" } }
      );

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Automify",
        description: `${data.plan} plan`,
        order_id: data.orderId,
        notes: { plan: data.plan },
        theme: { color: "#171717" },
        modal: {
          ondismiss: () => setPayingPlan(null),
        },
        handler: async (response) => {
          try {
            const verification = await axios.post<{ tier: BillingPlanName; credits: string }>(
              "/api/payment/verify",
              { plan: data.plan, ...response },
              { headers: { "Content-Type": "application/json" } }
            );

            setTier(verification.data.tier);
            setCredits(verification.data.credits);
            setPaymentError(null);
          } catch (verificationError) {
            setPaymentError("Payment was captured, but verification failed. Please contact support.");
            console.error("Failed to verify Razorpay payment:", verificationError);
          }
          setPayingPlan(null);
        },
      });

      checkout.open();
    } catch (error) {
      setPayingPlan(null);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? "Unable to start Razorpay checkout."
        : "Unable to start Razorpay checkout.";
      setPaymentError(message);
      console.error("Failed to start Razorpay payment:", error);
    }
  };

  return (
    <>
      <div className="flex gap-5">
        <SubscriptionCard
          onPayment={onPayment}
          payingPlan={payingPlan}
          tier={tier}
          products={products}
        />
      </div>
      {paymentError && <p className="mt-3 text-sm text-red-500">{paymentError}</p>}
      <CreditTracker tier={tier} credits={credits} />
    </>
  );
}
