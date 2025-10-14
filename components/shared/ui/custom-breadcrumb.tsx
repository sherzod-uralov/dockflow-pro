"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ReactNode } from "react";
import React from "react";

type BreadcrumbItemType = {
  label: string;
  href?: string;
  icon?: ReactNode;
};

interface PageHeaderProps {
  title: string;
  description?: string;
  items?: BreadcrumbItemType[];
}

export function PageHeader({
  title,
  description,
  items = [],
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full group">
      <div className="relative pl-3 transition-all duration-300 border-l-4 border-primary/90 hover:border-primary hover:bg-primary/5 hover:shadow-sm rounded-r-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-lg" />
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1 transition-colors duration-200 group-hover:text-primary/80">
              {description}
            </p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.icon && (
                      <span className="mr-1 text-primary/70">{item.icon}</span>
                    )}

                    {!isLast && item.href ? (
                      <BreadcrumbLink
                        href={item.href}
                        className="hover:text-primary transition-colors duration-200"
                      >
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        {item.label}
                      </span>
                    )}
                  </BreadcrumbItem>

                  {!isLast && (
                    <BreadcrumbSeparator>
                      <span className="text-primary/50">/</span>
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </div>
  );
}
