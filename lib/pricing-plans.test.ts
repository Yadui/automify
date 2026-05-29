import { describe, it, expect } from "vitest";
import {
  planPrices,
  billingPlanNames,
  billingPlans,
  getPlanCredits,
  isPaidBillingPlanName,
  type BillingPlanName,
} from "./pricing-plans";

describe("Pricing Plans", () => {
  describe("planPrices", () => {
    it("should define Free, Pro and Unlimited plans", () => {
      expect(planPrices).toHaveProperty("Free");
      expect(planPrices).toHaveProperty("Pro");
      expect(planPrices).toHaveProperty("Unlimited");
    });

    it("should assign correct unit amounts", () => {
      expect(planPrices.Free.unitAmount).toBe(0);
      expect(planPrices.Pro.unitAmount).toBe(500);
      expect(planPrices.Unlimited.unitAmount).toBe(2000);
    });
  });

  describe("billingPlanNames", () => {
    it("should contain all plan names in order", () => {
      expect(billingPlanNames).toEqual(["Free", "Pro", "Unlimited"]);
    });
  });

  describe("billingPlans", () => {
    it("should map every plan to an active billing plan object", () => {
      expect(billingPlans).toHaveLength(3);
      for (const plan of billingPlans) {
        expect(plan.active).toBe(true);
        expect(plan.id).toBeDefined();
        expect(plan.nickname).toBeDefined();
        expect(plan.unit_amount).toBeGreaterThanOrEqual(0);
        expect(plan.currency).toBe("USD");
      }
    });
  });

  describe("getPlanCredits", () => {
    it("should return correct credits for each plan", () => {
      expect(getPlanCredits("Free")).toBe("10");
      expect(getPlanCredits("Pro")).toBe("100");
      expect(getPlanCredits("Unlimited")).toBe("Unlimited");
    });
  });

  describe("isPaidBillingPlanName", () => {
    it("should return true for paid plans", () => {
      expect(isPaidBillingPlanName("Pro")).toBe(true);
      expect(isPaidBillingPlanName("Unlimited")).toBe(true);
    });

    it("should return false for Free", () => {
      expect(isPaidBillingPlanName("Free")).toBe(false);
    });

    it("should return false for invalid values", () => {
      expect(isPaidBillingPlanName("Basic")).toBe(false);
      expect(isPaidBillingPlanName("")).toBe(false);
      expect(isPaidBillingPlanName(null)).toBe(false);
      expect(isPaidBillingPlanName(undefined)).toBe(false);
      expect(isPaidBillingPlanName(123)).toBe(false);
    });
  });
});
