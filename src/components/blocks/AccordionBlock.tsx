"use client";

import { AccordionSectionData } from '@/types/models';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export function AccordionBlock({ data }: { data: AccordionSectionData }) {
    if (!data) return null;
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="w-full py-12 px-6 md:px-12 max-w-4xl mx-auto text-black">
            {data.title && (
                <h3 className="text-2xl md:text-3xl font-heading mb-8 text-center">{data.title}</h3>
            )}

            <div className="flex flex-col gap-4">
                {data.items?.map((item, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div key={idx} className="border-b border-black/10 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                                className="w-full flex items-center justify-between py-4 text-left focus:outline-none group"
                            >
                                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-[#c06b40]' : 'text-black group-hover:text-[#c06b40]'}`}>
                                    {item.title}
                                </span>
                                <span className="ml-4 shrink-0 text-black/40 group-hover:text-[#c06b40] transition-colors">
                                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </span>
                            </button>
                            <div
                                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <div className="overflow-hidden">
                                    <div
                                        className="prose prose-sm md:prose-base text-black max-w-none"
                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
