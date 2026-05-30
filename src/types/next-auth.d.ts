import { DefaultSession } from "next-auth";
import type { UserRole } from "@/config/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
      name: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
