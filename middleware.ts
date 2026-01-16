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

export default async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session");

  if (!sessionCookie && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
