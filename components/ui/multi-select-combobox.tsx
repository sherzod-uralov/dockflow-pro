"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
    value: string
    label: string
}

interface MultiSelectComboboxProps {
    options: MultiSelectOption[]
    value?: string[]
    onValueChange: (value: string[]) => void
    onSearchChange?: ((search: string) => void) | React.Dispatch<React.SetStateAction<string>>
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
}

export function MultiSelectCombobox({
                                        options,
                                        value = [],
                                        onValueChange,
                                        onSearchChange,
                                        placeholder = "Select options...",
                                        searchPlaceholder = "Search...",
                                        emptyText = "No results found.",
                                        disabled = false,
                                        className,
                                    }: MultiSelectComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedOptions = options.filter((option) => value.includes(option.value))

    const handleSearchChange = (searchValue: string) => {
        setSearch(searchValue)
        if (typeof onSearchChange === "function") {
            onSearchChange(searchValue)
        }
    }

    const handleSelect = (selectedValue: string) => {
        const newValue = value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue)
            : [...value, selectedValue]
        onValueChange(newValue)
    }

    const handleRemove = (valueToRemove: string) => {
        onValueChange(value.filter((v) => v !== valueToRemove))
    }

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between", className)}
                        disabled={disabled}
                    >
            <span className="truncate">
              {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder}
            </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={handleSearchChange} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                                        <Check className={cn("mr-2 h-4 w-4", value.includes(option.value) ? "opacity-100" : "opacity-0")} />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedOptions.map((option) => (
                        <Badge key={option.value} variant="secondary" className="gap-1">
                            {option.label}
                            <button
                                type="button"
                                onClick={() => handleRemove(option.value)}
                                className="ml-1 rounded-full hover:bg-muted"
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
