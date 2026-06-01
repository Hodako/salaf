import { FeatureGridSectionData } from '@/types/models';

export function FeatureGridBlock({ data }: { data: FeatureGridSectionData }) {
    if (!data) return null;

    const colsMap: Record<number, string> = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-2 lg:grid-cols-4'
    };

    const colsClass = colsMap[data.columns || 3] || 'grid-cols-3';

    return (
        <div className="w-full py-8 px-6 md:px-12 max-w-7xl mx-auto text-black">
            {data.title && (
                <div className="mb-4">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading text-black tracking-tight">{data.title}</h2>
                    {data.subtitle && (
                        <p className="mt-4 text-black/60 text-lg max-w-2xl mx-auto font-light leading-relaxed">{data.subtitle}</p>
                    )}
                </div>
            )}

            <div className={`grid ${colsClass} gap-x-2 sm:gap-x-4 md:gap-x-12 gap-y-16`}>
                {data.features?.map((feat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                        {/* Title and Description on Top with min-height for alignment */}
                        <div className="min-h-[90px] md:min-h-[120px] flex flex-col justify-center">
                            <h3 className="text-[10px] md:text-[16px] font-heading font-medium text-black mb-1 md:mb-2 group-hover:text-bprimary transition-colors tracking-widest uppercase">
                                {feat.title}
                            </h3>
                            <p className="text-black/60 leading-relaxed text-[8px] md:text-base mb-2 md:mb-8 max-w-[280px] font-light italic md:not-italic">
                                {feat.description}
                            </p>
                        </div>
                        
                        {/* Circular Image Below */}
                        <div className="relative w-20 h-20 sm:w-40 sm:h-40 md:w-64 md:h-64 rounded-full overflow-hidden bg-black/5 border border-black/5 transition-all duration-700 group-hover:scale-[1.05] group-hover:border-bprimary/20 shadow-sm">
                            {feat.iconUrl ? (
                                <img 
                                    src={feat.iconUrl} 
                                    alt={feat.title} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                />
                            ) : (
                                <div className="w-10 h-10 md:w-20 md:h-20 bg-black/5 rounded-full" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
