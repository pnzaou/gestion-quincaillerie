"use client"

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FormCombox = ({ value, onChange, options=[], placeholder = "Sélectionner...", className }) => {
    const [open, setOpen] = useState(false)

    const currentLabel = options.find((opt) => opt.value === value)?.label

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn("w-full justify-between", className)}
                >
                    {currentLabel || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Rechercher..." className="h-9"/>
                    <CommandList>
                        <CommandEmpty>Aucun résultat</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label.toLowerCase()}
                                    onSelect={() => {
                                        onChange(opt.value)
                                        setOpen(false)
                                    }}
                                >
                                    {opt.label}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        value === opt.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default FormCombox;
