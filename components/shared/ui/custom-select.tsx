"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  selectPlaceholder?: string;
  onChange?: (value: string) => void;
}

export function CustomSelect({
  options,
  onChange,
  selectPlaceholder,
}: CustomSelectProps) {
  return (
    <div className="w-full">
      <Select onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                className="hover:text-text-on-dark"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
