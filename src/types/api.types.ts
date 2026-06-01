import { ICouponDocument, IProductDocument } from './models.types';

export type ClientProduct = Omit<IProductDocument, keyof import('mongoose').Document | '_id'> & {
    _id: string;
};

export type ClientCoupon = Omit<ICouponDocument, keyof import('mongoose').Document | '_id'> & {
    _id: string;
};

export interface DashboardMetrics {
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
    recentOrders: any[]; // Avoid typing deep graph orders for mapping simplicity
    salesData: { date: string; amount: number }[];
}

export interface ShopFilters {
    query?: string;
    category?: string[] | string;
    subcategory?: string;
    collection?: string; // For hook mapping
    brand?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
}
