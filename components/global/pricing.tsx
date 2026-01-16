import React from "react";
import { Check } from "lucide-react";
import { LampComponent } from "./lamp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    name: "Hobby",
    price: "0",
    description: "Perfect for exploring the basics of automation.",
    features: [
      "3 Free automations",
      "50 tasks per month",
      "Two-step Actions",
      "Basic support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro Plan",
    price: "9",
    description: "Advanced features for power users and small teams.",
    features: [
      "Unlimited automations",
      "100 tasks per month",
      "Multi-step Actions",
      "24/7 Priority support",
      "Custom Webhooks",
    ],
    cta: "Get Started Now",
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "19",
    description: "The ultimate solution for scaling your workflows.",
    features: [
      "Unlimited automations",
      "Unlimited tasks per month",
      "Team collaboration",
      "Advanced analytics",
      "Custom branding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="w-full flex flex-col items-center">
      <LampComponent />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-72 px-4 sm:px-8 md:px-16 lg:px-24 w-full max-w-7xl relative z-10 overflow-visible">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative group flex flex-col p-8 rounded-3xl border transition-all duration-500",
              plan.highlighted
                ? "bg-[#1F1F1F] border-[#E2CBFF] shadow-2xl shadow-[#E2CBFF]/10 scale-105"
                : "bg-black/50 backdrop-blur-xl border-neutral-900 hover:border-neutral-800"
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E2CBFF] to-[#393BB2] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-neutral-500">/month</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {plan.description}
              </p>
            </div>

            <div className="flex-1 mb-8">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-neutral-300 text-sm"
                  >
                    <Check className="w-5 h-5 text-[#E2CBFF] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className={cn(
                "w-full py-6 rounded-2xl font-bold transition-all duration-300",
                plan.highlighted
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800"
              )}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
