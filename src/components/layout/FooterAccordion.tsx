"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterAccordionProps {
    menus: {
        title: string;
        links: { label: string; url: string }[];
    }[];
}

export function FooterAccordion({ menus }: FooterAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10 lg:gap-4 w-full h-full">
            {menus.map((menu, mIdx) => (
                <div key={mIdx} className="flex flex-col w-full lg:w-auto border-b border-black/10 lg:border-none pb-4 lg:pb-0">
                    <button 
                        onClick={() => toggle(mIdx)}
                        className="flex items-center justify-between w-full lg:hidden py-2"
                    >
                        <h4 className="text-gray-950 font-black text-[14px] uppercase tracking-wider font-heading">{menu.title}</h4>
                        <ChevronDown className={cn("w-4 h-4 text-gray-950 transition-transform duration-300", 
                            openIndex === mIdx ? "rotate-180" : ""
                        )} />
                    </button>
                    
                    {/* Desktop Header */}
                    <h4 className="hidden lg:block text-gray-950 font-black text-[14px] mb-8 uppercase tracking-widest font-heading">{menu.title}</h4>

                    <ul className={cn(
                        "space-y-4 text-[14px] text-gray-950/80 overflow-hidden transition-all duration-300",
                        "lg:max-h-none lg:opacity-100 lg:mt-0 font-lato",
                        openIndex === mIdx ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
                    )}>
                        {menu.links.map((link, lIdx) => (
                            <li key={lIdx}>
                                <Link href={link.url} className="hover:text-black hover:font-bold hover:scale-[1.01] transition-all">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
