import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer from './slices/uiSlice';
import { adminApi } from './api/adminApi';
import { productApi } from './api/productApi';

export const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
});
