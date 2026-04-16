import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const initialState = {
    mainCategories: [],
    categories: [],
    subCategories: [],
    insideSubCategories: [],
    loading: false,
    error: null,
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const fetchMainCategories = createAsyncThunk(
    'category/fetchMainCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/main-category/get-all');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createMainCategory = createAsyncThunk(
    'category/createMainCategory',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/main-category/create', data);
            dispatch(fetchMainCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateMainCategory = createAsyncThunk(
    'category/updateMainCategory',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.put(`/main-category/update/${id}`, data);
            dispatch(fetchMainCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteMainCategory = createAsyncThunk(
    'category/deleteMainCategory',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.delete(`/main-category/delete/${id}`);
            dispatch(fetchMainCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Category CRUD
export const fetchCategories = createAsyncThunk(
    'category/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/category/get-all');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/category/create', data);
            dispatch(fetchCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.put(`/category/update/${id}`, data);
            dispatch(fetchCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.delete(`/category/delete/${id}`);
            dispatch(fetchCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// SubCategory CRUD
export const fetchSubCategories = createAsyncThunk(
    'category/fetchSubCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/sub-category/get-all');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createSubCategory = createAsyncThunk(
    'category/createSubCategory',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/sub-category/create', data);
            dispatch(fetchSubCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateSubCategory = createAsyncThunk(
    'category/updateSubCategory',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.put(`/sub-category/update/${id}`, data);
            dispatch(fetchSubCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteSubCategory = createAsyncThunk(
    'category/deleteSubCategory',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.delete(`/sub-category/delete/${id}`);
            dispatch(fetchSubCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// InsideSubCategory CRUD
export const fetchInsideSubCategories = createAsyncThunk(
    'category/fetchInsideSubCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/inside-sub-category/get-all');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createInsideSubCategory = createAsyncThunk(
    'category/createInsideSubCategory',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.post('/inside-sub-category/create', data);
            dispatch(fetchInsideSubCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateInsideSubCategory = createAsyncThunk(
    'category/updateInsideSubCategory',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.put(`/inside-sub-category/update/${id}`, data);
            dispatch(fetchInsideSubCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteInsideSubCategory = createAsyncThunk(
    'category/deleteInsideSubCategory',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.delete(`/inside-sub-category/delete/${id}`);
            dispatch(fetchInsideSubCategories());
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Main Category
            .addCase(fetchMainCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMainCategories.fulfilled, (state, action) => {
                state.mainCategories = action.payload?.result || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchMainCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch categories";
            })
            .addCase(createMainCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createMainCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createMainCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(updateMainCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateMainCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateMainCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(deleteMainCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteMainCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteMainCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            // Category
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload?.result || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch categories";
            })
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            // SubCategory
            .addCase(fetchSubCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubCategories.fulfilled, (state, action) => {
                state.subCategories = action.payload?.result || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch sub categories";
            })
            .addCase(createSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createSubCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(updateSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSubCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(deleteSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteSubCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            // InsideSubCategory
            .addCase(fetchInsideSubCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInsideSubCategories.fulfilled, (state, action) => {
                state.insideSubCategories = action.payload?.result || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchInsideSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch inside sub categories";
            })
            .addCase(createInsideSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createInsideSubCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createInsideSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(updateInsideSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateInsideSubCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateInsideSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(deleteInsideSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteInsideSubCategory.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteInsideSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    },
});

export default categorySlice.reducer;
