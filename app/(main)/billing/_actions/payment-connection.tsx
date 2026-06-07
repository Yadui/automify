"use server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

export const onPaymentDetails = async () => {
  const { user } = await validateRequest();

  if (user) {
    const connection = await db.user.findUnique({
      where: {
        id: Number(user.id),
      },
      select: {
        tier: true,
        credits: true,
      },
    });

    return connection;
  }
  return null;
};
