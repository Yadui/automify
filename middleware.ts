import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = (pathname: string) => {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/connections") ||
    pathname.startsWith("/workflows")
  );
};

// Simple memory-based rate limiter for dev/demonstration
// NOTE: For production, use a distributed store like Upstash/Redis
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 20; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const rateLimit = (ip: string) => {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > RATE_LIMIT_WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  rateLimitMap.set(ip, userData);
  return userData.count <= RATE_LIMIT;
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || "127.0.0.1";

  // Apply rate limiting to API routes (excluding notifications which might be high volume)
  if (pathname.startsWith("/api") && !pathname.includes("/drive-activity")) {
    if (!rateLimit(ip)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      });
    }
  }

  const sessionCookie = request.cookies.get("auth_session");

  if (!sessionCookie && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
