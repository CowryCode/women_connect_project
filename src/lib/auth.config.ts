import type { NextAuthConfig } from "next-auth";

// Lightweight config used in middleware (Edge-safe — no Prisma, no bcrypt)
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isTempUser = (user as any).isTempUser ?? false;
        token.usageCount = (user as any).usageCount ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.isTempUser = token.isTempUser as boolean;
        session.user.usageCount = token.usageCount as number;
      }
      return session;
    },
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
