import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const initialState = {
    coupons: [],
    loading: false,
    saving: false,
    error: null,
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// Admin: fetch all coupons (including inactive/expired)
export const fetchAllCouponsAdmin = createAsyncThunk(
    'coupon/fetchAllAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/coupon/admin/get-all');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Admin: create coupon (multipart/form-data for optional image)
export const createCoupon = createAsyncThunk(
    'coupon/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/coupon/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Admin: update coupon
export const updateCoupon = createAsyncThunk(
    'coupon/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/coupon/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Admin: delete coupon
export const deleteCoupon = createAsyncThunk(
    'coupon/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/coupon/delete/${id}`);
            return id;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch all
        builder
            .addCase(fetchAllCouponsAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCouponsAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload?.result || [];
            })
            .addCase(fetchAllCouponsAdmin.rejected, (state, action) => {
                state.loading = false;
                state.coupons = [];
                state.error = action.payload?.message || 'Failed to fetch coupons';
            });

        // Create
        builder
            .addCase(createCoupon.pending, (state) => { state.saving = true; })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.saving = false;
                const newCoupon = action.payload?.result;
                if (newCoupon) state.coupons.unshift(newCoupon);
                toast.success('Coupon created successfully!');
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.saving = false;
                toast.error(action.payload?.message || 'Failed to create coupon');
            });

        // Update
        builder
            .addCase(updateCoupon.pending, (state) => { state.saving = true; })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.saving = false;
                const updated = action.payload?.result;
                if (updated) {
                    const idx = state.coupons.findIndex(c => c._id === updated._id);
                    if (idx !== -1) state.coupons[idx] = updated;
                }
                toast.success('Coupon updated successfully!');
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.saving = false;
                toast.error(action.payload?.message || 'Failed to update coupon');
            });

        // Delete
        builder
            .addCase(deleteCoupon.pending, (state) => { state.saving = true; })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.saving = false;
                state.coupons = state.coupons.filter(c => c._id !== action.payload);
                toast.success('Coupon deleted successfully!');
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.saving = false;
                toast.error(action.payload?.message || 'Failed to delete coupon');
            });
    },
});

export default couponSlice.reducer;
