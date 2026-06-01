import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../ProductCard';
import { ClientProduct } from '@/types';

// Safely mock Next.js routing and UI hooks context hooks
vi.mock('next/link', () => ({ default: ({ children }: any) => <a data-testid="next-link">{children}</a> }));
vi.mock('@/hooks/useCart', () => ({ useCart: () => ({ addToCart: vi.fn() }) }));
vi.mock('@/hooks/useWishlist', () => ({ useWishlist: () => ({ isInWishlist: () => false, toggleWishlist: vi.fn() }) }));
vi.mock('lucide-react', () => ({ 
    Heart: () => <svg data-testid="heart-icon" />, 
    ShoppingCart: () => <svg data-testid="cart-icon" />,
    Star: () => <svg data-testid="star-icon" />
}));
vi.mock('@/lib/gtm', () => ({ logSelectItem: vi.fn() }));

const mockProduct: ClientProduct = {
    _id: "prod_1",
    name: "Luxury Oud",
    slug: "luxury-oud",
    skuPrefix: "LOUD",
    featuredImage: "/img.jpg",
    images: [],
    tags: [],
    collections: [],
    variations: [{ volume: '50', volumeUnit: 'ml', basePrice: 5000 }],
    detailsSections: []
} as any;

describe('ProductCard Integration Suite', () => {
    it('successfully mounts and renders product title', () => {
        render(<ProductCard product={mockProduct} config={{ showPrice: true, showVolume: true, theme: 'dark' }} />);
        expect(screen.getByText('Luxury Oud')).toBeInTheDocument();
    });

    it('correctly calculates formatting for the base price constraint', () => {
        render(<ProductCard product={mockProduct} config={{ showPrice: true, showVolume: true, theme: 'dark' }} />);
        expect(screen.getByText(/5,000/)).toBeInTheDocument(); // Currency format assertion
    });
});
