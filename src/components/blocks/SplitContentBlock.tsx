import { SplitContentSectionData } from '@/types/models';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function SplitContentBlock({ data }: { data: SplitContentSectionData }) {
    if (!data) return null;
    const isMediaLeft = data.layout === 'mediaLeft';

    const ratioMap: Record<string, string> = {
        '50/50': 'md:w-1/2',
        '40/60': 'md:w-[40%] text-container:md:w-[60%]',
        '60/40': 'md:w-[60%] text-container:md:w-[40%]'
    };

    // Determine widths
    let mediaWidth = 'md:w-1/2';
    let textWidth = 'md:w-1/2';

    if (data.ratio === '40/60') {
        mediaWidth = 'md:w-[40%]';
        textWidth = 'md:w-[60%]';
    } else if (data.ratio === '60/40') {
        mediaWidth = 'md:w-[60%]';
        textWidth = 'md:w-[40%]';
    }

    const mediaOrder = isMediaLeft ? 'order-1' : 'order-1 md:order-2';
    const textOrder = isMediaLeft ? 'order-2' : 'order-2 md:order-1';

    return (
        <div className="w-full py-16 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                {/* Media Container */}
                <div className={`w-full ${mediaWidth} ${mediaOrder} relative rounded-2xl overflow-hidden aspect-square md:aspect-auto md:h-[600px] shadow-2xl border border-black/5`}>
                    {data.mediaType === 'video' && data.mediaUrl ? (
                        <iframe
                            src={data.mediaUrl}
                            className="absolute inset-0 w-full h-full object-cover"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (data.mediaUrl ? (
                        <img
                            src={data.mediaUrl}
                            alt={data.title || "Section Media"}
                            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center text-gray-500">
                            No Media Provided
                        </div>
                    ))}
                </div>

                {/* Text Container */}
                <div className={`w-full ${textWidth} ${textOrder} flex flex-col items-start`}>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading text-black tracking-tight leading-tight mb-6">
                        {data.title}
                    </h2>

                    <div
                        className="prose prose-lg text-black max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: data.htmlContent || '' }}
                    />

                    {data.buttonText && data.buttonLink && (
                        <Link
                            href={data.buttonLink}
                            className="inline-flex items-center gap-2 bg-transparent text-[#c06b40] hover:text-[#a65a35] border border-[#c06b40] hover:border-[#a65a35] px-8 py-4 rounded-full font-medium transition-all"
                        >
                            {data.buttonText}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>

            </div>
        </div>
    );
}
