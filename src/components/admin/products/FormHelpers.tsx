"use client";

import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
    content: string;
    className?: string;
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button" className={cn("text-gray-500 hover:text-[#c06b40] transition-colors cursor-help", className)}>
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#111] border-white/10 text-white text-[11px] max-w-[200px] leading-relaxed shadow-xl">
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function FormFieldLabel({ label, tooltip, required }: { label: string; tooltip?: string; required?: boolean }) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-semibold text-gray-200 tracking-wide uppercase text-[10px]">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {tooltip && <HelpTooltip content={tooltip} />}
        </div>
    );
}
