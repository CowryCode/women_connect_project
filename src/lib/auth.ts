import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Check regular users first
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (user) {
          if (!user.password || !user.isActive) return null;
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role, isTempUser: false };
        }

        // Fallback: check temp users
        const tempUser = await prisma.tempUser.findUnique({
          where: { email: credentials.email as string },
        });

        if (!tempUser || !tempUser.isActive) return null;
        const isValid = await bcrypt.compare(credentials.password as string, tempUser.password);
        if (!isValid) return null;

        return { id: tempUser.id, email: tempUser.email, name: tempUser.name, role: "USER", isTempUser: true , usageCount: tempUser.usageCount };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isTempUser = (user as any).isTempUser ?? false;
        token.usageCount = (user as any).usageCount ?? null;
      }
      // Re-fetch usageCount from DB on session refresh (update() call)
      if (token.isTempUser && token.id) {
        const tempUser = await prisma.tempUser.findUnique({
          where: { id: token.id as string },
          select: { usageCount: true },
        });
        token.usageCount = tempUser?.usageCount ?? 0;
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
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
