export const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.LOCAL_AUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "automify-next-auth-dev-secret" : undefined);