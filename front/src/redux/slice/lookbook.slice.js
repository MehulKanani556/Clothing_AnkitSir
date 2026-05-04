import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const initialState = {
    lookbooks: [],
    adminLookbooks: [],
    loading: false,
    error: null,
};

export const fetchLookbooks = createAsyncThunk(
    'lookbook/fetchLookbooks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/lookbook/get-all');
            return response.data.result;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const fetchLookbooksAdmin = createAsyncThunk(
    'lookbook/fetchLookbooksAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/lookbook/admin/get-all');
            return response.data.result;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const createLookbook = createAsyncThunk(
    'lookbook/createLookbook',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/lookbook/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.result;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const updateLookbook = createAsyncThunk(
    'lookbook/updateLookbook',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/lookbook/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.result;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const deleteLookbook = createAsyncThunk(
    'lookbook/deleteLookbook',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/lookbook/delete/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

const lookbookSlice = createSlice({
    name: 'lookbook',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Lookbooks
            .addCase(fetchLookbooks.pending, (state) => { state.loading = true; })
            .addCase(fetchLookbooks.fulfilled, (state, action) => {
                state.loading = false;
                state.lookbooks = action.payload;
            })
            .addCase(fetchLookbooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Admin Lookbooks
            .addCase(fetchLookbooksAdmin.fulfilled, (state, action) => {
                state.adminLookbooks = action.payload;
            })
            // Delete Lookbook
            .addCase(deleteLookbook.fulfilled, (state, action) => {
                state.adminLookbooks = state.adminLookbooks.filter(l => l._id !== action.payload);
                state.lookbooks = state.lookbooks.filter(l => l._id !== action.payload);
            });
    },
});

export default lookbookSlice.reducer;
