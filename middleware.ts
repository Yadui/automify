import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isLocalAuthEnabled, LOCAL_AUTH_COOKIE } from "@/lib/local-auth-config";
import { nextAuthSecret } from "@/lib/auth-secret";

const protectedRoutes = [
  "/dashboard(.*)",
  "/connections(.*)",
  "/workflows(.*)",
  "/billing(.*)",
  "/settings(.*)",
  "/support(.*)",
  "/guide(.*)",
  "/templates(.*)",
  "/forum(.*)",
] as const;

const isProtectedRoute = (pathname: string) =>
  protectedRoutes.some((route) => {
    const basePath = route.replace("(.*)", "");
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  });

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/guide/sign-in") {
    return NextResponse.redirect(new URL("/guide/apps", req.url));
  }

  const token = await getToken({ req, secret: nextAuthSecret });
  const hasLocalSession =
    isLocalAuthEnabled() && Boolean(req.cookies.get(LOCAL_AUTH_COOKIE)?.value);

  if (!token && !hasLocalSession && isProtectedRoute(req.nextUrl.pathname)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
