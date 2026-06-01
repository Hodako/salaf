"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TaxonomyItem, TaxonomySelectProps } from "@/types";

export function TaxonomySelect({
    placeholder,
    items,
    selectedIds,
    onChange,
    onCreate,
    isLoading,
    isCreating,
    multiple = true
}: TaxonomySelectProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (id: string) => {
        onChange(selectedIds.filter((i: string) => i !== id));
    };

    const handleSelect = (id: string) => {
        if (multiple === false) {
            onChange([id]);
            setOpen(false);
            return;
        }

        if (selectedIds.includes(id)) {
            handleUnselect(id);
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const handleCreate = async () => {
        if (!onCreate || !inputValue) return;
        try {
            const newItem = await onCreate(inputValue);
            if (multiple === false) {
                onChange([(newItem as TaxonomyItem)._id]);
                setOpen(false);
            } else {
                onChange([...selectedIds, (newItem as TaxonomyItem)._id]);
            }
            setInputValue("");
        } catch (error) {
        }
    };

    const selectedItems = items.filter((item: TaxonomyItem) => selectedIds.includes(item._id));

    return (
        <div className="flex flex-col gap-3">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-black border-white/10 hover:bg-white/5 hover:text-white h-auto py-2 px-4 min-h-[42px]"
                    >
                        <div className="flex flex-wrap gap-1 text-left">
                            {selectedItems.length > 0 ? (
                                multiple === false ? (
                                    <span className="text-white font-medium">{selectedItems[0].name}</span>
                                ) : (
                                    selectedItems.map((item) => (
                                        <Badge
                                            key={item._id}
                                            variant="secondary"
                                            className="bg-white/10 text-white border-none hover:bg-white/20"
                                        >
                                            {item.name}
                                            <button
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleUnselect(item._id);
                                                    }
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onClick={() => handleUnselect(item._id)}
                                            >
                                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        </Badge>
                                    ))
                                )
                            ) : (
                                <span className="text-gray-500">{placeholder}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-[#111] border-white/10" align="start">
                    <Command className="bg-transparent">
                        <CommandInput 
                            placeholder={`Search ${placeholder.toLowerCase()}...`} 
                            value={inputValue}
                            onValueChange={setInputValue}
                            className="text-white"
                        />
                        <CommandList>
                            <CommandEmpty className="py-2 px-4 text-sm text-gray-400">
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <span>No items found.</span>
                                        {onCreate && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="justify-start px-2 text-[#c06b40] hover:text-[#c06b40] hover:bg-[#c06b40]/10"
                                                onClick={handleCreate}
                                                disabled={isCreating}
                                            >
                                                {isCreating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                                                Create "{inputValue}"
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                                {items.map((item) => (
                                    <CommandItem
                                        key={item._id}
                                        value={item.name}
                                        onSelect={() => handleSelect(item._id)}
                                        className="text-gray-300 aria-selected:bg-white/5 aria-selected:text-white cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedIds.includes(item._id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
