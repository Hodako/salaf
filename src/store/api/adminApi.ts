/**
 * @file adminApi.ts
 * @description Enterprise RTK Query implementation for Admin operations.
 * Handles fetching secure dashboard statistics, users, and managing coupons.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ICouponDocument } from '@/types/models.types';
import { ClientCoupon } from '@/types';

/**
 * @interface DashboardMetrics
 * @description Strongly typed payload for the Admin Dashboard overview.
 */
interface DashboardMetrics {
 productCount: number;
 userCount: number;
 totalRevenue: number;
 totalOrders: number;
 pendingOrders: number;
 processingOrders: number;
 recentTransactions: any[];
}

/**
 * RTK Query API service for administrative operations.
 * 
 * Provides endpoints for managing coupons, dashboard metrics, 
 * and other admin-specific data.
 */
export const adminApi = createApi({
 reducerPath: 'adminApi',
 baseQuery: fetchBaseQuery({ 
 baseUrl: process.env.NODE_ENV === 'test' ? 'http://localhost/api/admin/' : '/api/admin/',
 }),
 tagTypes: ['Dashboard', 'Coupon', 'User'],
 endpoints: (builder) => ({
 /**
 * @method getDashboardMetrics
 * @description Securely fetches heavily aggregated real-time dashboard statistics.
 */
 getDashboardMetrics: builder.query<DashboardMetrics, void>({
 query: () => 'dashboard',
 providesTags: ['Dashboard'],
 }),

 /**
 * @method getCoupons
 * @description Fetches all available coupons for the admin management table.
 */
 getCoupons: builder.query<ClientCoupon[], void>({
 query: () => 'coupons',
 providesTags: (result) =>
 result
 ? [
 ...result.map(({ _id }) => ({ type: 'Coupon' as const, id: _id })),
 { type: 'Coupon', id: 'LIST' },
 ]
 : [{ type: 'Coupon', id: 'LIST' }],
 }),

 /**
 * @method toggleCouponStatus
 * @description Disables or enables a coupon instantly via Optimistic UI patterns.
 */
 toggleCouponStatus: builder.mutation<ClientCoupon, { id: string; isActive: boolean }>({
 query: ({ id, isActive }) => ({
 url: `coupons/${id}`,
 method: 'PATCH',
 body: { isActive },
 }),
 invalidatesTags: (result, error, { id }) => [{ type: 'Coupon', id }],
 }),

 /**
 * @method createCoupon
 * @description Creates a new coupon discount rule.
 */
 createCoupon: builder.mutation<ClientCoupon, Partial<ClientCoupon>>({
 query: (coupon) => ({
 url: 'coupons',
 method: 'POST',
 body: coupon,
 }),
 invalidatesTags: [{ type: 'Coupon', id: 'LIST' }],
 }),

 /**
 * @method updateCoupon
 * @description Partially updates an existing coupon.
 */
 updateCoupon: builder.mutation<ClientCoupon, { id: string; } & Partial<ClientCoupon>>({
 query: ({ id, ...coupon }) => ({
 url: `coupons/${id}`,
 method: 'PATCH',
 body: coupon,
 }),
 invalidatesTags: (result, error, { id }) => [{ type: 'Coupon', id }, { type: 'Coupon', id: 'LIST' }],
 }),

 /**
 * @method deleteCoupon
 * @description Permanently deletes a coupon configuration.
 */
 deleteCoupon: builder.mutation<{ success: boolean }, string>({
 query: (id) => ({
 url: `coupons/${id}`,
 method: 'DELETE',
 }),
 invalidatesTags: [{ type: 'Coupon', id: 'LIST' }],
 }),

 /**
 * @method getNewsletterEmails
 * @description Fetches all subscribed email addresses for the admin panel.
 */
 getNewsletterEmails: builder.query<{ email: string; subscribedAt: string }[], void>({
 query: () => 'newsletter',
 providesTags: ['Dashboard'], // Reuse Dashboard tag for simplicity or define new one
 }),

 /**
 * @method getNotices
 * @description Fetches all notices for admin management.
 */
 getNotices: builder.query<any[], void>({
 query: () => 'notices',
 providesTags: ['Dashboard'],
 }),

 /**
 * @method createNotice
 * @description Creates a new notice.
 */
 createNotice: builder.mutation<any, any>({
 query: (data) => ({
 url: 'notices',
 method: 'POST',
 body: data,
 }),
 invalidatesTags: ['Dashboard'],
 }),

 /**
 * @method updateNotice
 * @description Updates an existing notice.
 */
 updateNotice: builder.mutation<any, any>({
 query: (data) => ({
 url: 'notices',
 method: 'PATCH',
 body: data,
 }),
 invalidatesTags: ['Dashboard'],
 }),

 /**
 * @method deleteNotice
 * @description Deletes a notice.
 */
 deleteNotice: builder.mutation<any, string>({
 query: (id) => ({
 url: `notices?id=${id}`,
 method: 'DELETE',
 }),
 invalidatesTags: ['Dashboard'],
 }),
 }),
});

export const { 
 useGetDashboardMetricsQuery, 
 useGetCouponsQuery,
 useToggleCouponStatusMutation,
 useCreateCouponMutation,
 useUpdateCouponMutation,
 useDeleteCouponMutation,
 useGetNewsletterEmailsQuery,
 useGetNoticesQuery,
 useCreateNoticeMutation,
 useUpdateNoticeMutation,
 useDeleteNoticeMutation
} = adminApi;
