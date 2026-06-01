import React from "react";
import Image from "next/image";
import { FeatureGridSectionData } from "@/types";

interface FeatureGridProps {
    data: FeatureGridSectionData;
}

export function FeatureGrid({ data }: FeatureGridProps) {
    return (
        <section className="py-24 bg-black overflow-hidden">
            <div className="container mx-auto px-6">
                {(data.title || data.subtitle) && (
                    <div className="text-center mb-20 space-y-4">
                        {data.title && (
                            <h2 className="text-4xl md:text-5xl font-heading font-medium text-bprimary tracking-wide">
                                {data.title}
                            </h2>
                        )}
                        {data.subtitle && (
                            <p className="text-gray-400 font-light max-w-2xl mx-auto">
                                {data.subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-${data.columns || 3} gap-12 lg:gap-20`}>
                    {data.features.map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            {feature.iconUrl && (
                                <div className="relative w-48 h-48 mb-8 rounded-full overflow-hidden border border-white/10 group-hover:border-bprimary/30 transition-all duration-700 shadow-2xl">
                                    <Image 
                                        src={feature.iconUrl} 
                                        alt={feature.title} 
                                        fill 
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                                    />
                                    {/* Overlay Glow */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
                                </div>
                            )}
                            <h3 className="text-xl font-heading font-medium text-white mb-3 tracking-wide group-hover:text-bprimary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-[13px] text-gray-500 font-light leading-relaxed max-w-[200px]">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
