import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { adminApi } from './api/adminApi';
import { productApi } from './api/productApi';

/**
 * The central Redux store for the application.
 * 
 * Configured with the root reducer, custom middleware for API services 
 * (adminApi, productApi), and serialized check disabled for Firebase compatibility.
 */
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(adminApi.middleware, productApi.middleware),
});
