"use client";

import { useSession } from "next-auth/react";

export const useAuthToken = () => {
  const { data: session, status } = useSession();

  return {
    accessToken: session?.accessToken,
    refreshToken: session?.refreshToken,
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  };
};

export default useAuthToken;
