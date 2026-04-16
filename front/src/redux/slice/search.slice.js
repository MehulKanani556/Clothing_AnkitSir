import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';

export const searchProducts = createAsyncThunk(
    'search/searchProducts',
    async (query, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/product/search?q=${encodeURIComponent(query)}`);
            return response.data.result || response.data.data || [];
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const logSearch = createAsyncThunk(
    'search/logSearch',
    async (query, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/search/log`, { query });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPopularSearches = createAsyncThunk(
    'search/fetchPopularSearches',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/search/popular`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchRecentSearches = createAsyncThunk(
    'search/fetchRecentSearches',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/search/recent`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchTrendingProducts = createAsyncThunk(
    'search/fetchTrendingProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/search/trending`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        popularSearches: [],
        recentSearches: [],
        trendingProducts: [],
        searchResults: [],
        searchLoading: false,
        loading: false,
        error: null
    },
    reducers: {
        clearSearchResults: (state) => {
            state.searchResults = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPopularSearches.fulfilled, (state, action) => {
                state.popularSearches = action.payload;
            })
            .addCase(fetchRecentSearches.fulfilled, (state, action) => {
                state.recentSearches = action.payload;
            })
            .addCase(fetchRecentSearches.rejected, (state) => {
                state.recentSearches = [];
            })
            .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
                state.trendingProducts = action.payload;
            })
            .addCase(searchProducts.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.searchResults = action.payload;
                state.searchLoading = false;
            })
            .addCase(searchProducts.rejected, (state) => {
                state.searchResults = [];
                state.searchLoading = false;
            });
    }
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
