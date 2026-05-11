import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planPrices } from "@/lib/pricing-plans";

const plans = [
  {
    name: "Hobby",
    price: planPrices.Free.landingLabel,
    description: "For testing automations and validating small personal workflows.",
    features: ["50 tasks per month", "Two-step actions", "Community support"],
  },
  {
    name: "Pro",
    price: planPrices.Pro.landingLabel,
    description: "For operators who need repeatable workflows across core business apps.",
    features: ["100 tasks per month", "Multi-app workflows", "Priority support"],
    featured: true,
  },
  {
    name: "Unlimited",
    price: planPrices.Unlimited.landingLabel,
    description: "For teams building production automations with heavier usage.",
    features: ["Unlimited automations", "200 tasks per month", "Team collaboration"],
  },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="ds-eyebrow">Pricing</p>
        <h2 className="ds-section-title mt-4">Start simple. Scale when the workflows do.</h2>
        <p className="mt-4 text-lg leading-7 text-[#4d4d4d]">
          Clear tiers, restrained surfaces, and no surprise UI drama when you are trying to ship automations.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="ds-card flex flex-col p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="ds-card-title">{plan.name}</h3>
              {plan.featured && <span className="ds-pill">Recommended</span>}
            </div>
            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-semibold leading-none tracking-[-2.4px] text-[#171717]">{plan.price}</span>
              <span className="text-sm text-[#666666]">/mo</span>
            </div>
            <p className="mt-6 min-h-16 leading-6 text-[#4d4d4d]">{plan.description}</p>
            <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-[#4d4d4d]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#171717]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8" variant={plan.featured ? "default" : "outline"}>
              <Link href="/dashboard">Get started</Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
