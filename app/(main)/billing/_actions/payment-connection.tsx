"use server";

import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";

export const onPaymentDetails = async () => {
  const user = await getAppUser();

  if (user) {
    const connection = await db.user.findFirst({
      where: {
        appId: user.id,
      },
      select: {
        tier: true,
        credits: true,
      },
    });

    if (user) {
      return connection;
    }
  }
};
