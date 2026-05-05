import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/BASE_URL';

export const fetchAllSubscribers = createAsyncThunk(
    'newsletter/fetchAllSubscribers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/newsletter/get-all`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch subscribers' });
        }
    }
);

export const deleteSubscriber = createAsyncThunk(
    'newsletter/deleteSubscriber',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/newsletter/delete/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to delete subscriber' });
        }
    }
);

const newsletterSlice = createSlice({
    name: 'newsletter',
    initialState: {
        subscribers: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSubscribers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSubscribers.fulfilled, (state, action) => {
                state.loading = false;
                state.subscribers = action.payload?.result || [];
            })
            .addCase(fetchAllSubscribers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch subscribers';
            })
            .addCase(deleteSubscriber.fulfilled, (state, action) => {
                state.subscribers = state.subscribers.filter(s => s._id !== action.payload);
            });
    }
});

export default newsletterSlice.reducer;
