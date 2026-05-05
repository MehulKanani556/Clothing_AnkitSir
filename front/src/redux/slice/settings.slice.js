import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/settings/get');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch settings' });
        }
    }
);

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (settingsData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/settings/update', settingsData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to update settings' });
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        settings: null,
        loading: false,
        updateLoading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload?.result || null;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch settings';
            })
            .addCase(updateSettings.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.settings = action.payload?.result || null;
                toast.success('Settings updated successfully');
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.updateLoading = false;
                toast.error(action.payload?.message || 'Failed to update settings');
            });
    }
});

export default settingsSlice.reducer;
