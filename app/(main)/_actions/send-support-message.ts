"use server";

import { validateRequest } from "@/lib/auth";

export const onSendSupportMessage = async (
  email: string,
  message: string,
  topic: string,
) => {
  const { user } = await validateRequest();

  // In a real app, you would use Nodemailer or Resend here.
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'onboarding@resend.dev',
  //   to: 'abhinavyadav8@gmail.com',
  //   subject: `Support Request: ${topic}`,
  //   text: `From: ${email}\nUser ID: ${user?.id || 'Guest'}\n\n${message}`
  // });

  console.log("Support Message Received:");
  console.log("From:", email);
  console.log("Topic:", topic);
  console.log("Message:", message);
  console.log("User:", user?.id);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true, message: "Support request sent successfully!" };
};
