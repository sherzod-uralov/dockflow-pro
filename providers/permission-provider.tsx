"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";

interface PermissionContextType {
  permissions: {
    resources: Record<string, Record<string, boolean>>;
    raw: string[];
  } | null;
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
  can: (resource: string, action: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const { data: profile, isLoading } = useGetProfileQuery();

  const hasPermission = (key: string): boolean => {
    if (!profile?.permissions?.raw) return false;
    return profile.permissions.raw.includes(key);
  };

  const can = (resource: string, action: string): boolean => {
    if (!profile?.permissions?.resources) return false;
    return profile.permissions.resources[resource]?.[action] === true;
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions: profile?.permissions || null,
        isLoading,
        hasPermission,
        can,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};
