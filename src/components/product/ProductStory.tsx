import { ProductStoryProps } from "@/types";
import { DynamicBlocksRenderer } from "@/components/blocks/DynamicBlocksRenderer";
import { CollapsibleStory } from "./CollapsibleStory";

export function ProductStory({ sections }: ProductStoryProps) {
    if (!sections || sections.length === 0) return null;

    // Filter sections: accordion blocks (FAQs) should stay outside the collapsible area
    const collapsibleSections = sections.filter(s => s.type !== 'accordion');
    const persistentSections = sections.filter(s => s.type === 'accordion');
    
    return (
        <div className="flex flex-col">
            {collapsibleSections.length > 0 && (
                <CollapsibleStory threshold={600}>
                    <DynamicBlocksRenderer sections={collapsibleSections} />
                </CollapsibleStory>
            )}
            
            {persistentSections.length > 0 && (
                <div className={collapsibleSections.length > 0 ? "pt-12" : ""}>
                    <DynamicBlocksRenderer sections={persistentSections} />
                </div>
            )}
        </div>
    );
}
