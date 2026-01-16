"use server";

import db from "@/lib/db";

export const getUserData = async (id: number) => {
  const user_info = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      connections: true,
    },
  });

  return user_info;
};
