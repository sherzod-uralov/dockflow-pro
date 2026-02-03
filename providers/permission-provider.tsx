"use client";

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
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

  const hasPermission = useCallback(
    (key: string): boolean => {
      if (!profile?.permissions?.raw) return false;
      return profile.permissions.raw.includes(key);
    },
    [profile?.permissions?.raw],
  );

  const can = useCallback(
    (resource: string, action: string): boolean => {
      if (!profile?.permissions?.resources) return false;
      return profile.permissions.resources[resource]?.[action] === true;
    },
    [profile?.permissions?.resources],
  );

  const value = useMemo(
    () => ({
      permissions: profile?.permissions || null,
      isLoading,
      hasPermission,
      can,
    }),
    [profile?.permissions, isLoading, hasPermission, can],
  );

  return (
    <PermissionContext.Provider value={value}>
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
