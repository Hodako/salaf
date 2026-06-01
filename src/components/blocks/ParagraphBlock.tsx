import { ParagraphSectionData } from '@/types/models';

export function ParagraphBlock({ data }: { data: ParagraphSectionData }) {
    if (!data) return null;

    const alignMap: Record<string, string> = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify'
    };

    const sizeMap: Record<string, string> = {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg md:text-xl',
        xl: 'text-xl md:text-2xl'
    };

    const alignClass = alignMap[data.alignment || 'left'];
    const sizeClass = sizeMap[data.size || 'base'];
    const colorClass = data.textColor || 'text-black';

    // Using dangerouslySetInnerHTML to support bold/italic/links that the admin typed
    return (
        <div className="w-full py-2 px-6 md:px-12 max-w-7xl mx-auto">
            <p
                className={`${alignClass} ${sizeClass} ${colorClass} leading-relaxed prose max-w-none whitespace-pre-wrap`}
                dangerouslySetInnerHTML={{ __html: data.htmlContent || '' }}
            />
        </div>
    );
}
