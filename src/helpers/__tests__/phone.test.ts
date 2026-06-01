import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, isValidBangladeshPhone } from '../phone';

describe('phone helper', () => {
    describe('normalizePhoneNumber', () => {
        it('should return empty string for empty input', () => {
            expect(normalizePhoneNumber('')).toBe('');
        });

        it('should remove non-numeric characters', () => {
            expect(normalizePhoneNumber('0171a-2b3c4d5e')).toBe('01712345');
        });

        it('should handle +880 prefix', () => {
            expect(normalizePhoneNumber('+8801712345678')).toBe('01712345678');
        });

        it('should handle 880 prefix', () => {
            expect(normalizePhoneNumber('8801712345678')).toBe('01712345678');
        });

        it('should add leading zero to 10-digit numbers', () => {
            expect(normalizePhoneNumber('1712345678')).toBe('01712345678');
        });

        it('should not add leading zero if it already starts with zero', () => {
            expect(normalizePhoneNumber('01712345678')).toBe('01712345678');
        });

        it('should return the original digits if no special rules apply', () => {
            expect(normalizePhoneNumber('12345')).toBe('12345');
        });
    });

    describe('isValidBangladeshPhone', () => {
        it('should return true for valid 11-digit numbers starting with 01', () => {
            expect(isValidBangladeshPhone('01712345678')).toBe(true);
            expect(isValidBangladeshPhone('+8801712345678')).toBe(true);
            expect(isValidBangladeshPhone('1712345678')).toBe(true);
        });

        it('should return false for invalid numbers', () => {
            expect(isValidBangladeshPhone('0123456789')).toBe(false); // 10 digits
            expect(isValidBangladeshPhone('02712345678')).toBe(false); // starts with 02
            expect(isValidBangladeshPhone('abcdefghijk')).toBe(false); // non-numeric
            expect(isValidBangladeshPhone('')).toBe(false);
        });
    });
});
