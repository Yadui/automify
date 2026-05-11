import "server-only";

import crypto from "crypto";
import { planPrices, type PaidBillingPlanName } from "@/lib/pricing-plans";

type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  notes?: {
    plan?: string;
    userId?: string;
    email?: string;
  };
};

const getRazorpayCredentials = (): RazorpayCredentials | null => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  return { keyId, keySecret };
};

const getRazorpayAuthHeader = (credentials: RazorpayCredentials) =>
  `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`;

export const createRazorpayOrder = async (input: {
  plan: PaidBillingPlanName;
  userId: string;
  email: string;
}) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) return { ok: false as const, status: 503, error: "Razorpay is not configured." };

  const plan = planPrices[input.plan];
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuthHeader(credentials),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: plan.unitAmount,
      currency: plan.currency,
      receipt: `automify_${Date.now().toString(36)}`,
      notes: {
        plan: input.plan,
        userId: input.userId,
        email: input.email,
      },
    }),
  });

  if (!response.ok) {
    return { ok: false as const, status: response.status, error: "Unable to create Razorpay order." };
  }

  const order = (await response.json()) as RazorpayOrder;

  return {
    ok: true as const,
    keyId: credentials.keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan: input.plan,
  };
};

export const verifyRazorpayPaymentSignature = (input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) return false;

  const payload = `${input.orderId}|${input.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", credentials.keySecret)
    .update(payload)
    .digest("hex");

  const receivedSignature = Buffer.from(input.signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  return (
    receivedSignature.length === expectedSignatureBuffer.length &&
    crypto.timingSafeEqual(receivedSignature, expectedSignatureBuffer)
  );
};

export const getRazorpayOrder = async (orderId: string) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) return null;

  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: {
      Authorization: getRazorpayAuthHeader(credentials),
    },
  });

  if (!response.ok) return null;

  return (await response.json()) as RazorpayOrder;
};