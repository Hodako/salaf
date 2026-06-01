import { ButtonSectionData } from '@/types/models';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ButtonBlock({ data }: { data: ButtonSectionData }) {
    if (!data) return null;
    const alignMap: Record<string, string> = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    };

    const sizeMap: Record<string, string> = {
        sm: 'px-4 py-2 text-sm',
        default: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const styleMap: Record<string, string> = {
        primary: 'bg-[#c06b40] text-black hover:bg-[#c06b40]/90 font-medium',
        secondary: 'bg-white text-black hover:bg-gray-100 font-medium',
        outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5 font-medium',
        ghost: 'bg-transparent text-[#c06b40] hover:text-[#c06b40]/80 underline-offset-4 hover:underline font-medium'
    };

    const alignClass = alignMap[data.alignment || 'left'];
    const sizeClass = sizeMap[data.size || 'default'];
    const btnStyleClass = styleMap[data.style || 'primary'];

    // Handle external vs internal links
    const isExternal = data.link?.startsWith('http');

    const btnClasses = `inline-flex items-center justify-center gap-2 rounded-full transition-all ${sizeClass} ${btnStyleClass}`;

    return (
        <div className={`w-full py-4 px-6 md:px-12 max-w-7xl mx-auto flex ${alignClass}`}>
            {isExternal ? (
                <a href={data.link} target="_blank" rel="noopener noreferrer" className={btnClasses}>
                    {data.text}
                    {data.style !== 'ghost' && <ArrowRight className="w-4 h-4" />}
                </a>
            ) : (
                <Link href={data.link || '#'} className={btnClasses}>
                    {data.text}
                    {data.style !== 'ghost' && <ArrowRight className="w-4 h-4" />}
                </Link>
            )}
        </div>
    );
}
