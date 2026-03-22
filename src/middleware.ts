import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isHomeRoute = req.nextUrl.pathname === "/";
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  if (isHomeRoute && !isLoggedIn) {                  
      return NextResponse.redirect(new URL("/login", req.url));
    }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!["ADMIN", "SUPERADMIN"].includes(userRole as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/","/admin/:path*"],
};
