export const planPrices = {
  Free: {
    id: "free",
    label: "Free",
    landingLabel: "$0",
    monthlyLabel: "Free",
    unitAmount: 0,
    currency: "USD",
    credits: "10",
    description: "For starters validating small personal automations.",
  },
  Pro: {
    id: "pro",
    label: "Pro",
    landingLabel: "$5",
    monthlyLabel: "$5/mo",
    unitAmount: 500,
    currency: "USD",
    credits: "100",
    description: "For repeatable workflows across core business apps.",
  },
  Unlimited: {
    id: "unlimited",
    label: "Unlimited",
    landingLabel: "$20",
    monthlyLabel: "$20/mo",
    unitAmount: 2000,
    currency: "USD",
    credits: "Unlimited",
    description: "For production automations with heavier usage.",
  },
} as const;

export type BillingPlanName = keyof typeof planPrices;
export type PaidBillingPlanName = Exclude<BillingPlanName, "Free">;

export const isPaidBillingPlanName = (value: unknown): value is PaidBillingPlanName =>
  value === "Pro" || value === "Unlimited";

export const billingPlanNames = ["Free", "Pro", "Unlimited"] as const satisfies readonly BillingPlanName[];

export const billingPlans = billingPlanNames.map((name) => ({
  id: planPrices[name].id,
  nickname: name,
  description: planPrices[name].description,
  active: true,
  unit_amount: planPrices[name].unitAmount,
  currency: planPrices[name].currency,
  credits: planPrices[name].credits,
}));

export const getPlanCredits = (plan: BillingPlanName) => planPrices[plan].credits;