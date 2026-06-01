/**
 * @file components.types.ts
 * @description Centralized Enterprise UI Component Types.
 * This file strictly defines the Properties and Payload structures expected by Reusable UI components.
 * By isolating them here, we ensure cross-component predictability and enforce React best practices.
 */

import { ClientProduct } from './api.types';

/**
 * @interface ProductCardProps
 * @description Properties required to render a Product Card in shop grids.
 */
export interface ProductCardProps {
    /** The core product document retrieved from the database */
    product: ClientProduct;
    /** Component config passed down from the CMS Section */
    config: any; // We use 'any' temporarily since FeaturedProductsSectionData might not exist here.
    /** Toggle for star ratings overlay */
    showReviews?: boolean;
}

/**
 * @interface ProductViewProps
 * @description Core rendering properties for the immersive Product detail modal/page.
 */
export interface ProductViewProps {
    /** The core product data */
    product: ClientProduct;
    /** Aggregated rating metadata */
    reviewStats: {
        avgRating: number;
        totalReviews: number;
    };
}

import { IProduct } from './models/page.type';

export interface RelatedProductsProps {
    products: IProduct[];
}

export interface IVariation {
    _id?: string;
    volume: string;
    volumeUnit: string;
    basePrice: number;
    salePrice?: number;
    stock?: number;
    sku?: string;
    image?: string;
    variantType?: string;
}

/**
 * @interface IVariationForm
 * @description Version of IVariation used in forms where prices are strings.
 */
export interface IVariationForm {
    volume: string;
    volumeUnit: string;
    basePrice: string;
    salePrice: string;
    stock?: string | number;
    sku?: string;
    image?: string;
    variantType?: string;
}

export interface VariationManagerProps {
    variations: IVariationForm[];
    onChange: (variations: IVariationForm[]) => void;
}
import { ISection } from './models/page.type';

export interface ProductStoryProps {
    sections: ISection[];
}

export interface ProductHeroProps {
    product: IProduct;
}
import { IReviewDocument } from './models.types';

export interface ReviewSectionProps {
    productId: string;
    productName: string;
    reviews: any[];
    stats: {
        avgRating: number;
        totalReviews: number;
        starDistribution: { star: number; count: number; percentage: number }[];
    };
}

export interface HelpTooltipProps {
    content: string;
    className?: string;
}

export interface TaxonomyItem {
    _id: string;
    name: string;
}

export interface TaxonomySelectProps {
    placeholder: string;
    items: TaxonomyItem[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    onCreate?: (name: string) => Promise<TaxonomyItem>;
    isLoading?: boolean;
    isCreating?: boolean;
    multiple?: boolean;
}

export type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode;
        icon?: React.ComponentType;
    } & (
        | { color?: string; theme?: never }
        | { color?: never; theme: Record<"light" | "dark", string> }
    );
};

export interface ImgBBUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
    mini?: boolean;
}
