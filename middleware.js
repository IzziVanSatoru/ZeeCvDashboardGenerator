import { NextResponse } from "next/server";

export function middleware(req) {
  const session = req.cookies.get("session")?.value;

  // Jika belum login dan mau ke /dashboard, redirect ke /
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
