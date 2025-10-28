"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SkeletonWrapperProps = {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
};

const SkeletonWrapper = ({
  isLoading,
  children,
  className,
}: SkeletonWrapperProps) => {
  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        {/* avatar + ism */}
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>

        {/* grid ma’lumotlar */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-4 w-36 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SkeletonWrapper;
