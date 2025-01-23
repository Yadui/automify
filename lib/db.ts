import { PrismaClient } from "@prisma/client";

declare global {
  // This prevents the `PrismaClient` from being re-declared in development mode
  // which can cause issues with HMR (Hot Module Replacement).
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

// In development, ensure the Prisma client is reused to avoid exhausting database connections
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
