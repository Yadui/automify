"use server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth";

export const getUserInfo = async () => {
  const { user } = await validateRequest();

  if (user) {
    const dbUser = await db.user.findUnique({
      where: {
        id: Number(user.id),
      },
      select: {
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return dbUser;
  }
  return null;
};
