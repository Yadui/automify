import { NextResponse, NextRequest } from "next/server";
import { billingPlans, isPaidBillingPlanName } from "@/lib/pricing-plans";
import { getAppUser } from "@/lib/app-auth";
import { createRazorpayOrder } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(billingPlans);
}

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const plan = data.plan;

  if (!isPaidBillingPlanName(plan)) {
    return NextResponse.json({ error: "Choose a paid plan." }, { status: 400 });
  }

  const order = await createRazorpayOrder({
    plan,
    userId: user.id,
    email: user.email,
  });

  if (!order.ok) {
    return NextResponse.json({ error: order.error }, { status: order.status });
  }

  return NextResponse.json(order);
}
