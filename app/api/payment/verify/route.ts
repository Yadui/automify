import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";
import { getPlanCredits, isPaidBillingPlanName, planPrices } from "@/lib/pricing-plans";
import { getRazorpayOrder, verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const plan = data.plan;
  const orderId = data.razorpay_order_id;
  const paymentId = data.razorpay_payment_id;
  const signature = data.razorpay_signature;

  if (!isPaidBillingPlanName(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing Razorpay payment fields." }, { status: 400 });
  }

  const validSignature = verifyRazorpayPaymentSignature({ orderId, paymentId, signature });
  if (!validSignature) {
    return NextResponse.json({ error: "Invalid Razorpay payment signature." }, { status: 400 });
  }

  const order = await getRazorpayOrder(orderId);
  const expectedPlan = planPrices[plan];
  const orderMatchesPlan =
    order?.amount === expectedPlan.unitAmount &&
    order.currency === expectedPlan.currency &&
    order.notes?.plan === plan &&
    order.notes?.userId === user.id;

  if (!orderMatchesPlan) {
    return NextResponse.json({ error: "Razorpay order does not match this purchase." }, { status: 400 });
  }

  const credits = getPlanCredits(plan);
  await db.user.update({
    where: { appId: user.id },
    data: {
      tier: plan,
      credits,
    },
  });

  return NextResponse.json({ ok: true, tier: plan, credits });
}