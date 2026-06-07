"use server";

import db from "@/lib/db";

export const getUserData = async (id: string | number) => {
  const user_info = await db.user.findFirst({
    where: typeof id === "number" ? { id } : { appId: String(id) },
    include: {
      connections: true,
    },
  });

  return user_info;
};
