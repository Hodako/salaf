import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '@/types/store.types';

const initialState: UIState = {
    isSidebarOpen: false,
    activeModal: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
        },
        openModal: (state, action: PayloadAction<string>) => {
            state.activeModal = action.payload;
        },
        closeModal: (state) => {
            state.activeModal = null;
        },
    },
});

export const { toggleSidebar, setSidebarOpen, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
