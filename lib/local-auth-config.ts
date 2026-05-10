export const LOCAL_AUTH_COOKIE = "automify_local_session";

export const isLocalAuthEnabled = () =>
  process.env.LOCAL_AUTH_ENABLED === "true" ||
  process.env.NODE_ENV !== "production";