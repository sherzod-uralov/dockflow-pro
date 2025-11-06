"use client";

import React, { ReactNode, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CustomFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  onReset: () => void;
  onApply: () => void;
  hasActiveFilters: boolean;
  children: ReactNode;
  resetLabel?: string;
  applyLabel?: string;
}

export function CustomFilter({
  isOpen,
  onToggle,
  onReset,
  onApply,
  hasActiveFilters,
  children,
  resetLabel = "Tozalash",
  applyLabel = "Qo'llash",
}: CustomFilterProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const height = contentRef.current.scrollHeight;
          contentRef.current.style.maxHeight = `${height}px`;
          contentRef.current.style.opacity = "1";
        }
      });
    } else {
      if (contentRef.current) {
        contentRef.current.style.maxHeight = "0px";
        contentRef.current.style.opacity = "0";
      }
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      ref={contentRef}
      className="overflow-hidden transition-all duration-500 ease-in-out"
      style={{
        maxHeight: "0px",
        opacity: 0,
      }}
    >
      <Card className="my-4 p-6 border-border shadow-sm">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {children}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={!hasActiveFilters}
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              {resetLabel}
            </Button>
            <Button onClick={onApply} size="sm">
              {applyLabel}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      {children}
    </div>
  );
}
