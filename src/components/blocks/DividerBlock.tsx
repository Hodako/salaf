import { DividerSectionData } from '@/types/models';

export function DividerBlock({ data }: { data: DividerSectionData }) {
    if (!data) return null;
    const marginMap: Record<string, string> = {
        'my-4': 'my-4',
        'my-8': 'my-8',
        'my-16': 'my-16',
        'my-24': 'my-24'
    };

    const styleMap: Record<string, string> = {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted'
    };

    const marginClass = marginMap[data.margin || 'my-8'];
    const styleClass = styleMap[data.style || 'solid'];

    // Support either Tailwind border color or Hex
    const isHex = data.color?.startsWith('#');
    const colorClass = data.color && !isHex ? data.color : 'border-white/10';
    const inlineStyle = isHex ? { borderColor: data.color, borderWidth: `${data.thickness || 1}px 0 0 0` } : { borderWidth: `${data.thickness || 1}px 0 0 0` };

    return (
        <div className={`w-full max-w-7xl mx-auto px-6 md:px-12 ${marginClass}`}>
            <div
                className={`w-full ${styleClass} ${colorClass}`}
                style={inlineStyle}
            />
        </div>
    );
}
