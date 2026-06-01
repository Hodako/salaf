import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/types';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
/**
 * Custom hook for dispatching Redux actions with type safety.
 * 
 * @returns The typed `AppDispatch` function.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Custom hook for selecting state from the Redux store with type safety.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
