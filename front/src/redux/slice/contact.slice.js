import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/BASE_URL';

export const submitContactInquiry = createAsyncThunk(
    'contact/submitContactInquiry',
    async (inquiryData, { rejectWithValue }) => {
        try {
            const payload = {
                name: inquiryData.name,
                email: inquiryData.email,
                message: inquiryData.message
            };
            const response = await axios.post(`${BASE_URL}/contact/add`, payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to submit message' });
        }
    }
);

export const submitSupportInquiry = createAsyncThunk(
    'contact/submitSupportInquiry',
    async (inquiryData, { rejectWithValue }) => {
        try {
            const payload = {
                name: inquiryData.fullName,
                email: inquiryData.email,
                subject: inquiryData.subject,
                message: inquiryData.message
            };
            const response = await axios.post(`${BASE_URL}/support/add`, payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to submit inquiry' });
        }
    }
);

const contactSlice = createSlice({
    name: 'contact',
    initialState: {
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        resetContactState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Contact
            .addCase(submitContactInquiry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitContactInquiry.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(submitContactInquiry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
            })
            // Support
            .addCase(submitSupportInquiry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitSupportInquiry.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(submitSupportInquiry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
            });
    }
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
