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

export const fetchAllContacts = createAsyncThunk(
    'contact/fetchAllContacts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/contact/get-all`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch contact messages' });
        }
    }
);

export const deleteContact = createAsyncThunk(
    'contact/deleteContact',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${BASE_URL}/contact/delete/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to delete contact message' });
        }
    }
);

export const fetchAllSupport = createAsyncThunk(
    'contact/fetchAllSupport',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/support/get-all`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch support tickets' });
        }
    }
);

export const deleteSupport = createAsyncThunk(
    'contact/deleteSupport',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${BASE_URL}/support/delete/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to delete support ticket' });
        }
    }
);

const contactSlice = createSlice({
    name: 'contact',
    initialState: {
        contacts: [],
        support: [],
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
            // Contact Submission
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
            // Support Submission
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
            })
            // Fetch All Contacts
            .addCase(fetchAllContacts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload?.result || [];
            })
            .addCase(fetchAllContacts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch contacts';
            })
            // Delete Contact
            .addCase(deleteContact.fulfilled, (state, action) => {
                state.contacts = state.contacts.filter(c => c._id !== action.payload);
            })
            // Fetch All Support
            .addCase(fetchAllSupport.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllSupport.fulfilled, (state, action) => {
                state.loading = false;
                state.support = action.payload?.result || [];
            })
            .addCase(fetchAllSupport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch support tickets';
            })
            // Delete Support
            .addCase(deleteSupport.fulfilled, (state, action) => {
                state.support = state.support.filter(s => s._id !== action.payload);
            });
    }
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
