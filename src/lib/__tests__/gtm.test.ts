import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
 pushToDataLayer, 
 logViewItemList, 
 logViewItem, 
 logAddToWishlist, 
 logAddToCart, 
 logSelectItem, 
 logSearch, 
 logLogin, 
 logSignUp, 
 logBeginCheckout, 
 logAddShippingInfo, 
 logAddPaymentInfo, 
 logViewCart, 
 logPurchase 
} from '../gtm';

describe('gtm utility', () => {
 beforeEach(() => {
 // Mock window.dataLayer
 (window as any).dataLayer = [];
 });

 afterEach(() => {
 delete (window as any).dataLayer;
 });

 describe('pushToDataLayer', () => {
 it('should push data to window.dataLayer', () => {
 const event = { event: 'test_event' };
 pushToDataLayer(event);
 expect((window as any).dataLayer).toContain(event);
 });

 it('should clear ecommerce before pushing new ecommerce data', () => {
 pushToDataLayer({ event: 'test', ecommerce: { items: [] } });
 expect((window as any).dataLayer[0]).toEqual({ ecommerce: null });
 expect((window as any).dataLayer[1]).toEqual({ event: 'test', ecommerce: { items: [] } });
 });
 });

 describe('logging functions', () => {
 const mockProduct = {
 _id: '123',
 name: 'Test Product',
 basePrice: 100,
 slug: 'test-product'
 };

 const mockCartItem = {
 productId: '123',
 productName: 'Test Product',
 price: 100,
 quantity: 2,
 volume: '500ml'
 };

 it('should logViewItemList', () => {
 logViewItemList([mockProduct], 'Category Page');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'view_item_list');
 expect(event.ecommerce.item_list_name).toBe('Category Page');
 expect(event.ecommerce.items[0].item_id).toBe('123');
 });

 it('should logViewItem', () => {
 logViewItem(mockProduct);
 const event = (window as any).dataLayer.find((e: any) => e.event === 'view_item');
 expect(event.ecommerce.items[0].item_id).toBe('123');
 expect(event.value).toBe(100);
 });

 it('should logAddToWishlist', () => {
 logAddToWishlist(mockProduct);
 const event = (window as any).dataLayer.find((e: any) => e.event === 'add_to_wishlist');
 expect(event.ecommerce.items[0].item_id).toBe('123');
 });

 it('should logAddToCart', () => {
 logAddToCart(mockProduct, { volume: '500ml' }, 2);
 const event = (window as any).dataLayer.find((e: any) => e.event === 'add_to_cart');
 expect(event.ecommerce.items[0].quantity).toBe(2);
 expect(event.ecommerce.value).toBe(200);
 });

 it('should logSelectItem', () => {
 logSelectItem(mockProduct, 'Search Results');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'select_item');
 expect(event.ecommerce.item_list_name).toBe('Search Results');
 });

 it('should logSearch', () => {
 logSearch('test query');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'search');
 expect(event.search_term).toBe('test query');
 });

 it('should logLogin', () => {
 logLogin('Email');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'login');
 expect(event.method).toBe('Email');
 });

 it('should logSignUp', () => {
 logSignUp('Google');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'sign_up');
 expect(event.method).toBe('Google');
 });

 it('should logBeginCheckout', () => {
 logBeginCheckout([mockCartItem], 200);
 const event = (window as any).dataLayer.find((e: any) => e.event === 'begin_checkout');
 expect(event.ecommerce.value).toBe(200);
 expect(event.ecommerce.items[0].item_id).toBe('123');
 });

 it('should logAddShippingInfo', () => {
 logAddShippingInfo([mockCartItem], 250, 'Express');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'add_shipping_info');
 expect(event.ecommerce.shipping_tier).toBe('Express');
 });

 it('should logAddPaymentInfo', () => {
 logAddPaymentInfo([mockCartItem], 250, 'Credit Card');
 const event = (window as any).dataLayer.find((e: any) => e.event === 'add_payment_info');
 expect(event.ecommerce.payment_type).toBe('Credit Card');
 });

 it('should logViewCart', () => {
 logViewCart([mockCartItem], 200);
 const event = (window as any).dataLayer.find((e: any) => e.event === 'view_cart');
 expect(event.ecommerce.value).toBe(200);
 });

 it('should logPurchase', () => {
 const mockOrder = {
 _id: 'order_123',
 totalAmount: 300,
 shippingFee: 50,
 items: [
 {
 product: '123',
 productName: 'Test Product',
 price: 100,
 quantity: 2,
 volume: '500ml'
 }
 ]
 };
 logPurchase(mockOrder);
 const event = (window as any).dataLayer.find((e: any) => e.event === 'purchase');
 expect(event.ecommerce.transaction_id).toBe('order_123');
 expect(event.ecommerce.value).toBe(300);
 });
 });
});
