import { BannerSectionData } from '@/types/models';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function BannerBlock({ data }: { data: BannerSectionData }) {
    if (!data) return null;
    const heightMap: Record<string, string> = {
        sm: 'min-h-[30vh] md:min-h-[40vh]',
        md: 'min-h-[50vh] md:min-h-[60vh]',
        lg: 'min-h-[70vh] md:min-h-[80vh]',
        screen: 'min-h-[90vh]'
    };

    const alignMap: Record<string, string> = {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end'
    };

    const heightClass = heightMap[data.height || 'md'];
    const alignClass = alignMap[data.textAlignment || 'center'];
    const opacityVal = (data.overlayOpacity ?? 60) / 100;

    return (
        <div className={`relative w-full ${heightClass} flex flex-col justify-center overflow-hidden`}>
            {/* Background Image / Video */}
            {data.bgImageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${data.bgImageUrl})` }}
                />
            )}

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-white/10 pointer-events-none"
                style={{ opacity: opacityVal }}
            />

            {/* Content Container */}
            <div className={`relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col ${alignClass}`}>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-heading text-black tracking-tight leading-tight mb-4 drop-shadow-sm">
                    {data.title}
                </h2>

                {data.subtitle && (
                    <p className="text-lg md:text-2xl text-black/70 mb-8 max-w-3xl drop-shadow-sm">
                        {data.subtitle}
                    </p>
                )}

                {data.buttonText && data.buttonLink && (
                    <Link
                        href={data.buttonLink}
                        className="inline-flex items-center justify-center gap-2 bg-[#c06b40] text-white px-8 py-4 rounded-full font-medium hover:bg-black transition-colors shadow-lg"
                    >
                        {data.buttonText}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </div>
    );
}
