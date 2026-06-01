/**
 * @file models.types.ts
 * @description Centralized Mongoose Document Types.
 * This file acts as the single source of truth for all MongoDB document interfaces.
 */

import mongoose, { Document } from 'mongoose';

/**
 * @interface IUserDocument
 * @description Represents a registered user (Customer or Admin) in the database.
 */
export interface IUserDocument extends Document {
    email: string;
    name: string;
    image?: string;
    role: 'customer' | 'admin';
    firebaseUid?: string;
    wishlist: mongoose.Types.ObjectId[];
    phoneNumber?: string;
    address?: {
        division: string;
        district: string;
        upazila: string;
        postCode: string;
        streetAddress: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface IProductDocument
 * @description Represents an e-commerce product, including its variations, pricing, and CMS sections.
 */
export interface IProductDocument extends Document {
    name: string;
    slug: string;
    skuPrefix: string;
    featuredImage: string;
    images: string[];
    tags: mongoose.Types.ObjectId[];
    collections: mongoose.Types.ObjectId[];
    category?: mongoose.Types.ObjectId;
    subcategory?: mongoose.Types.ObjectId;
    subSubcategory?: mongoose.Types.ObjectId;
    seoTitle?: string;
    seoDescription?: string;
    fragranceFamily?: string;
    gender?: 'Unisex' | 'Men' | 'Women';
    occasion?: string;
    variations: {
        volume: string;
        volumeUnit: string;
        basePrice: number;
        salePrice?: number;
        stock?: number;
        sku?: string;
        image?: string;
        variantType?: string;
    }[];
    attributes?: {
        key: string;
        value: string;
    }[];
    brand?: mongoose.Types.ObjectId | {
        _id: string | mongoose.Types.ObjectId;
        name: string;
        slug: string;
        logo: string;
        description: string;
    };
    detailsSections: unknown[]; // Strictly typing dynamic CMS layout elements rather than 'any'
    isOnSale?: boolean;
}

/**
 * @interface IOrderItem
 * @description Represents a specific product line item within an order.
 */
export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    featuredImage: string;
    volume: string;
    variantType?: string;
}

/**
 * @interface IOrderDocument
 * @description Represents a customer purchase transaction, keeping historical price and delivery logs.
 */
export interface IOrderDocument extends Document {
    user: mongoose.Types.ObjectId | string;
    items: IOrderItem[];
    shippingAddress: {
        division: string;
        district: string;
        upazila: string;
        postCode: string;
        streetAddress: string;
    };
    phoneNumber: string;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentStatus: 'Unpaid' | 'Paid';
    couponCode?: string;
    discountAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface ICouponDocument
 * @description Represents a promotional discount configuration applied at checkout.
 */
export interface ICouponDocument extends Document {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    maxDiscountAmount?: number;
    minimumPurchaseAmount?: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit?: number;
    maxUsesPerUser?: number;
    usedCount: number;
    isActive: boolean;
}

/**
 * @interface ICategoryDocument
 * @description Represents a hierarchical product category (Category -> Subcategory -> Sub-subcategory).
 */
export interface ICategoryDocument extends Document {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parent?: mongoose.Types.ObjectId;
    level: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface ICollectionDocument
 * @description Represents a category or curated collection of products.
 */
export interface ICollectionDocument extends Document {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface IReviewDocument
 * @description Represents a user's textual and rating review for a specific product.
 */
export interface IReviewDocument extends Document {
    product: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    user?: string;
    rating: number;
    comment?: string;
    images?: string[];
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface IExternalReviewDocument
 * @description Represents a manually entered review from an external platform (e.g. Facebook).
 */
export interface IExternalReviewDocument extends Document {
    reviewerName: string;
    content: string;
    rating: number;
    images?: string[];
    source: 'FACEBOOK' | 'GOOGLE' | 'INSTAGRAM' | 'OTHERS';
    link?: string;
    date?: Date;
    product?: mongoose.Types.ObjectId;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface ISettingsDocument
 * @description Global configuration store for dynamic site-wide variables.
 */
export interface ISettingsDocument extends Document {
    key: string;
    value: unknown; // Safe unknown instead of 'any'
    updatedAt: Date;
}

/**
 * @interface IShippingDocument
 * @description Outlines a specific shipping method, its cost, and delivery timeline.
 */
export interface IShippingDocument extends Document {
    name: string;
    cost: number;
    estimatedDays: string;
    freeShippingThreshold?: number;
    isActive: boolean;
}

/**
 * @interface IDeliveryZoneDocument
 * @description Regional fee definitions explicitly mapping geographical administrative lines to costs.
 */
export interface IDeliveryZoneDocument extends Document {
    name: string;
    division?: string;
    district?: string;
    upazila?: string;
    deliveryFee: number;
    freeDeliveryThreshold?: number;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface ITagDocument
 * @description Informational taxonomy badge for SEO and rapid product segregation.
 */
export interface ITagDocument extends Document {
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * @interface IBrandDocument
 * @description Represents a brand with its identity and description.
 */
export interface IBrandDocument extends Document {
    name: string;
    slug: string;
    logo: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

// IPage and IPageDocument are moved to models/page.type.ts for modularity.

/**
 * @interface IBlogPostDocument
 * @description Represents a blog article inside the database, fully optimized for rich snippets and content tagging.
 */
export interface IBlogPostDocument extends Document {
    title: string;
    slug: string;
    content: string;
    summary: string;
    featuredImage: string;
    author: {
        name: string;
        image: string;
        bio?: string;
        twitter?: string;
    };
    type: 'buying-guide' | 'product-comparison' | 'tutorial' | 'general';
    tags: string[];
    faqs: {
        question: string;
        answer: string;
    }[];
    relatedProducts: mongoose.Types.ObjectId[];
    status: 'draft' | 'published';
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

