import { ISection } from '@/types/models';
import { Hero, AboutUs, OurValues } from '@/components/home';
import { ProductHero, ImageGallery, VideoEmbed, RichText } from '@/components/product';

import { HeadingBlock } from './HeadingBlock';
import { ParagraphBlock } from './ParagraphBlock';
import { BannerBlock } from './BannerBlock';
import { SplitContentBlock } from './SplitContentBlock';
import { FeatureGridBlock } from './FeatureGridBlock';
import { AccordionBlock } from './AccordionBlock';
import { ButtonBlock } from './ButtonBlock';
import { DividerBlock } from './DividerBlock';
import { SpacerBlock } from './SpacerBlock';

interface DynamicBlocksRendererProps {
    sections: ISection[];
}

export function DynamicBlocksRenderer({ sections }: DynamicBlocksRendererProps) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="w-full flex flex-col pb-2 text-black">
            {sections.map((section, index) => {
                const key = `block-${index}-${section.type}`;

                // --- Legacy Blocks ---
                if (section.type === "about") return <AboutUs key={key} data={section.data || {} as any} />;
                if (section.type === "values") return <OurValues key={key} data={section.data || {} as any} />;
                if (section.type === "hero") return <Hero key={key} data={section.data || {} as any} />;
                if (section.type === "image_gallery") return <ImageGallery key={key} data={section.data || {} as any} />;
                if (section.type === "video_embed") return <VideoEmbed key={key} data={section.data || {} as any} />;
                if (section.type === "rich_text") return <RichText key={key} data={section.data || {} as any} />;

                // --- New Elementor Blocks ---
                if (section.type === "heading") return <HeadingBlock key={key} data={section.data || {} as any} />;
                if (section.type === "paragraph") return <ParagraphBlock key={key} data={section.data || {} as any} />;
                if (section.type === "banner") return <BannerBlock key={key} data={section.data || {} as any} />;
                if (section.type === "split_content") return <SplitContentBlock key={key} data={section.data || {} as any} />;
                if (section.type === "feature_grid") return <FeatureGridBlock key={key} data={section.data || {} as any} />;
                if (section.type === "accordion") return <AccordionBlock key={key} data={section.data || {} as any} />;
                if (section.type === "button") return <ButtonBlock key={key} data={section.data || {} as any} />;
                if (section.type === "divider") return <DividerBlock key={key} data={section.data || {} as any} />;
                if (section.type === "spacer") return <SpacerBlock key={key} data={section.data || {} as any} />;

                return <div key={key} className="hidden">Unknown Block Type: {section.type}</div>;
            })}
        </div>
    );
}
