import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username: string;
    fullname: string;
    bio: string;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      fullname: string;
      bio: string;
    };
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      username: string;
      fullname: string;
      bio: string;
    };
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}
