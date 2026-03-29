import type { NextAuthConfig } from "next-auth";

// Lightweight config used in middleware (Edge-safe — no Prisma, no bcrypt)
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;

      const isAdminRoute = pathname.startsWith("/admin");
      const isHomeRoute = pathname === "/";

      if (isHomeRoute && !isLoggedIn) return false;

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const role = auth?.user?.role as string;
        if (!["ADMIN", "SUPERADMIN"].includes(role)) return false;
      }

      return true;
    },
  },
};
