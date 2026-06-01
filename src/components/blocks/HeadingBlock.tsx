import { HeadingSectionData } from '@/types/models';

export function HeadingBlock({ data }: { data: HeadingSectionData }) {
    if (!data) return null;
    const Tag = data.tag || 'h2';

    const alignMap: Record<string, string> = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    const sizeMap: Record<string, string> = {
        h1: 'text-3xl md:text-5xl lg:text-7xl',
        h2: 'text-2xl md:text-4xl lg:text-5xl',
        h3: 'text-xl md:text-3xl lg:text-4xl',
        h4: 'text-lg md:text-2xl lg:text-3xl',
        h5: 'text-base md:text-xl lg:text-2xl',
        h6: 'text-sm md:text-lg lg:text-xl'
    };

    const alignClass = alignMap[data.alignment || 'left'];
    const sizeClass = sizeMap[Tag];

    // Support either a tailwind class (e.g. text-red-500) or a hex code
    const isHex = data.color?.startsWith('#');
    const colorClass = data.color && !isHex ? data.color : (data.isGradient ? '' : 'text-black');
    const style = isHex ? { color: data.color } : {};

    let gradientClass = '';
    if (data.isGradient) {
        gradientClass = 'bg-clip-text text-transparent bg-gradient-to-r from-bprimary to-yellow-600';
    }

    return (
        <div className="w-full py-4 px-6 md:px-12 max-w-7xl mx-auto">
            <Tag className={`${alignClass} ${sizeClass} ${colorClass} ${gradientClass} font-heading tracking-tight`} style={style}>
                {data.text}
            </Tag>
        </div>
    );
}
