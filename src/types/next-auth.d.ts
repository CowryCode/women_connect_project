import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isTempUser?: boolean;
      usageCount?: number; 
    } & DefaultSession["user"];
  }
}
