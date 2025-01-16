import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ensure body data is available
    if (!body?.data) {
      return new NextResponse("Invalid webhook payload", { status: 400 });
    }

    const { id, email_addresses, first_name, image_url } = body.data;

    // Safeguard for missing email
    const email = email_addresses?.[0]?.email_address || ""; // Fallback to empty string if missing
    const firstName = first_name || "Unknown"; // Fallback name if missing
    const profileImage = image_url || "https://default-image-url.com"; // Fallback image URL

    console.log("✅ Webhook Payload:", body);

    // Upsert user in the database
    await db.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name: firstName,
        profileImage,
      },
      create: {
        clerkId: id,
        email,
        name: firstName,
        profileImage,
      },
    });

    return new NextResponse("User updated in database successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating database:", error);
    return new NextResponse("Error updating user in database", { status: 500 });
  }
}
