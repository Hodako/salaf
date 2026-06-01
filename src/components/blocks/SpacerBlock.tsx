import { SpacerSectionData } from '@/types/models';

export function SpacerBlock({ data }: { data: SpacerSectionData }) {
    if (!data) return null;
    const height = data.height || 64;
    return <div style={{ height: `${height}px` }} className="w-full" aria-hidden="true" />;
}
