import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, email_addresses, first_name, image_url } = body?.data;

    if (!id || !email_addresses?.[0]?.email_address) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const email = email_addresses[0]?.email_address;
    console.log("✅ Webhook received:", { id, email });

    await db.$connect();
    console.log("✅ Database connected");

    const user = await db.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name: first_name,
        profileImage: image_url,
      },
      create: {
        clerkId: id,
        email,
        name: first_name || "",
        profileImage: image_url || "",
      },
    });

    console.log("✅ User upserted:", user.id);
    return new NextResponse("User updated in database successfully", {
      status: 200,
    });
  } catch (err) {
    console.error("Error in webhook handler:", err);
    return new NextResponse(`Error updating user in database`, {
      status: 500,
    });
  } finally {
    await db.$disconnect();
  }
}
