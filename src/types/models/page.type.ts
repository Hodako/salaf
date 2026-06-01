export interface HeroSectionData {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
}

export interface AboutSectionData {
    title: string;
    description: string;
    bgImageUrl: string;
}

export interface ValuesSectionData {
    title: string;
    paragraphs: string[];
    imageUrl: string;
}

export interface FeaturedProductsSectionData {
    title: string;
    cardConfig: {
        showPrice: boolean;
        showVolume: boolean;
        theme: 'dark' | 'light';
        listName?: string;
    };
}

export interface ImageGallerySectionData {
    layoutStyle: 'grid' | 'carousel' | 'masonry';
    images: string[];
}

export interface VideoEmbedSectionData {
    videoUrl: string;
    title?: string;
}

export interface RichTextSectionData {
    htmlContent: string;
}

export interface RichTextSectionData {
    htmlContent: string;
}

// ----------------------------------------------------
// NEW ELEMENTOR-STYLE BLOCKS
// ----------------------------------------------------

export interface HeadingSectionData {
    text: string;
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    alignment: 'left' | 'center' | 'right';
    color?: string; // Hex or tailwind class
    isGradient?: boolean;
}

export interface ParagraphSectionData {
    htmlContent: string; // Supports basic formatting
    alignment: 'left' | 'center' | 'right' | 'justify';
    size: 'sm' | 'base' | 'lg' | 'xl';
    textColor?: string;
}

export interface BannerSectionData {
    bgImageUrl: string;
    bgVideoUrl?: string; // Optional background video
    overlayOpacity: number; // 0 to 100
    title: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    height: 'sm' | 'md' | 'lg' | 'screen';
    textAlignment: 'left' | 'center' | 'right';
}

export interface SplitContentSectionData {
    layout: 'mediaLeft' | 'mediaRight';
    ratio: '50/50' | '40/60' | '60/40';
    mediaType: 'image' | 'video';
    mediaUrl: string;
    title: string;
    htmlContent: string; // Rich text
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
}

export interface FeatureGridSectionData {
    title?: string;
    subtitle?: string;
    columns: 2 | 3 | 4;
    features: {
        iconUrl?: string; // Can be an SVG string or image URL
        title: string;
        description: string;
    }[];
}

export interface ButtonSectionData {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
    alignment: 'left' | 'center' | 'right';
    size: 'sm' | 'default' | 'lg';
}

export interface DividerSectionData {
    style: 'solid' | 'dashed' | 'dotted';
    thickness: number; // px
    color?: string;
    margin: 'sm' | 'md' | 'lg' | 'xl';
}

export interface AccordionSectionData {
    title?: string;
    items: {
        title: string;
        content: string; // html
    }[];
}

export interface SpacerSectionData {
    height: number; // px
}

// Create a discriminated union for all section types
export type SectionType =
    | 'hero' | 'about' | 'values' | 'featured_products' | 'image_gallery' | 'video_embed' | 'rich_text'
    | 'heading' | 'paragraph' | 'banner' | 'split_content' | 'feature_grid' | 'button' | 'divider' | 'accordion' | 'spacer';

export interface ISection {
    type: SectionType;
    data: HeroSectionData
    | AboutSectionData
    | ValuesSectionData
    | FeaturedProductsSectionData
    | ImageGallerySectionData
    | VideoEmbedSectionData
    | RichTextSectionData
    // Elementor Blocks
    | HeadingSectionData
    | ParagraphSectionData
    | BannerSectionData
    | SplitContentSectionData
    | FeatureGridSectionData
    | ButtonSectionData
    | DividerSectionData
    | AccordionSectionData
    | SpacerSectionData
    | any;
}

export interface IProduct {
    _id: string;
    name: string;
    slug: string;
    skuPrefix: string;
    variations: {
        volume: string;
        volumeUnit: 'ml' | 'pcs' | 'g';
        basePrice: number;
        salePrice?: number;
        sku?: string;
    }[];

    // Media
    images: string[];
    featuredImage: string; // The primary thumbnail

    // SEO & Classification
    seoTitle?: string;
    seoDescription?: string;
    // Taxonomy
    tags: string[]; 
    collections: string[];
    fragranceFamily?: string;
    gender?: 'Unisex' | 'Men' | 'Women';
    occasion?: string;
    brand?: {
        _id: string;
        name: string;
        slug: string;
        logo?: string;
        description?: string;
    };

    // Optional variants configuration can be expanded here later

    // Dynamic Layout array reusing our exact same Page Engine! 
    // Lets the seller inject any component block into the middle of the Product Page.
    detailsSections: ISection[];

    createdAt: Date;
    updatedAt: Date;
}
export interface IPage {
    slug: string;
    title: string;
    description?: string;
    sections: ISection[];
    
    // Theme Builder Extensions
    type?: 'page' | 'product_template' | 'shop_template';
    isHome?: boolean;
    status?: 'draft' | 'published';
    html?: string;
    css?: string;
    seo?: {
        title?: string;
        description?: string;
        ogImage?: string;
    };
}
export interface IPageDocument extends IPage, Document { }
