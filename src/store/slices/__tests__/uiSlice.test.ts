import { describe, it, expect } from 'vitest';
import reducer, { toggleSidebar, setSidebarOpen, openModal, closeModal } from '../uiSlice';

describe('uiSlice', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual({
            isSidebarOpen: false,
            activeModal: null,
        });
    });

    it('should toggle sidebar', () => {
        let state = reducer(undefined, toggleSidebar());
        expect(state.isSidebarOpen).toBe(true);
        state = reducer(state, toggleSidebar());
        expect(state.isSidebarOpen).toBe(false);
    });

    it('should set sidebar open', () => {
        const state = reducer(undefined, setSidebarOpen(true));
        expect(state.isSidebarOpen).toBe(true);
    });

    it('should handle modal opening/closing', () => {
        let state = reducer(undefined, openModal('LOGIN_MODAL'));
        expect(state.activeModal).toBe('LOGIN_MODAL');
        
        state = reducer(state, closeModal());
        expect(state.activeModal).toBeNull();
    });
});
