import { describe, it, expect } from 'vitest';
import User from '../User';
import Product from '../Product';
import Order from '../Order';
import Category from '../Collection';
import Tag from '../Tag';
import Review from '../Review';
import Coupon from '../Coupon';
import DeliveryZone from '../DeliveryZone';

import Page from '../Page';
import Settings from '../Settings';
import Shipping from '../Shipping';

describe('Mongoose Models', () => {
    it('should have User model defined', () => {
        expect(User).toBeDefined();
        expect(User.modelName).toBe('User');
    });

    it('should have Product model defined', () => {
        expect(Product).toBeDefined();
        expect(Product.modelName).toBe('Product');
    });

    it('should have Order model defined', () => {
        expect(Order).toBeDefined();
        expect(Order.modelName).toBe('Order');
    });

    it('should have Category model defined', () => {
        expect(Category).toBeDefined();
        expect(Category.modelName).toBe('Collection');
    });

    it('should have Tag model defined', () => {
        expect(Tag).toBeDefined();
        expect(Tag.modelName).toBe('Tag');
    });

    it('should have Review model defined', () => {
        expect(Review).toBeDefined();
        expect(Review.modelName).toBe('Review');
    });

    it('should have Coupon model defined', () => {
        expect(Coupon).toBeDefined();
        expect(Coupon.modelName).toBe('Coupon');
    });

    it('should have DeliveryZone model defined', () => {
        expect(DeliveryZone).toBeDefined();
        expect(DeliveryZone.modelName).toBe('DeliveryZone');
    });


    it('should have Page model defined', () => {
        expect(Page).toBeDefined();
        expect(Page.modelName).toBe('Page');
    });

    it('should have Settings model defined', () => {
        expect(Settings).toBeDefined();
        expect(Settings.modelName).toBe('Settings');
    });

    it('should have Shipping model defined', () => {
        expect(Shipping).toBeDefined();
        expect(Shipping.modelName).toBe('Shipping');
    });
});
