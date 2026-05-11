"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { planPrices, type BillingPlanName } from "@/lib/pricing-plans";

// Define the product type
interface Product {
  id: string;
  nickname: BillingPlanName;
  description?: string;
  credits?: number;
  price?: number;
}

interface SubscriptionCardProps {
  onPayment: (nickname: BillingPlanName) => void;
  payingPlan: BillingPlanName | null;
  products: Product[];
  tier: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  onPayment,
  payingPlan,
  products,
  tier,
}) => {
  // Helper function to get product description
  const getProductDescription = (nickname: Product["nickname"]): string => {
    switch (nickname) {
      case "Unlimited":
        return "Run heavier production automations with unlimited workflow credits.";
      case "Pro":
        return "Unlock more monthly credits and support for repeatable multi-app workflows.";
      case "Free":
        return "Start with a small monthly credit allowance for testing Automify workflows.";
      default:
        return "";
    }
  };

  // Helper function to get product credits
  const getProductCredits = (nickname: Product["nickname"]): string => {
    switch (nickname) {
      case "Free":
        return "10";
      case "Pro":
        return "100";
      case "Unlimited":
        return "unlimited";
      default:
        return "";
    }
  };

  // Helper function to get product price
  const getProductPrice = (nickname: Product["nickname"]): string =>
    planPrices[nickname].monthlyLabel;

  return (
    <section className="grid w-full gap-4 md:grid-cols-3">
      {products?.map((product) => {
        const priceLabel = getProductPrice(product.nickname);
        const isFreePlan = product.nickname === "Free";
        const isActivePlan = product.nickname === tier;
        const isLoading = payingPlan === product.nickname;

        return (
          <Card className="p-6" key={product.id}>
            <CardHeader className="p-0">
              <CardTitle>{product.nickname}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 p-0 pt-6">
              <CardDescription className="min-h-28">
                {getProductDescription(product.nickname)}
              </CardDescription>
              <div className="flex justify-between gap-4 rounded-md bg-[#fafafa] p-4 text-sm shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                <p className="text-[#4d4d4d]">{getProductCredits(product.nickname)} credits</p>
                <p className="font-semibold text-[#171717]">{priceLabel}</p>
              </div>
              {isActivePlan ? (
                <Button disabled variant="outline">
                  Active
                </Button>
              ) : isFreePlan ? (
                <Button disabled variant="outline">
                  Included
                </Button>
              ) : (
                <Button disabled={isLoading} onClick={() => onPayment(product.nickname)} variant="outline">
                  {isLoading ? "Opening Razorpay" : "Purchase"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

export default SubscriptionCard;
