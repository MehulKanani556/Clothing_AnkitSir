import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchAllPayments = createAsyncThunk(
    'payment/fetchAllPayments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/payment/admin/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch payment history' });
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        payments: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload?.result || [];
            })
            .addCase(fetchAllPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch payment history';
            });
    }
});

export default paymentSlice.reducer;
