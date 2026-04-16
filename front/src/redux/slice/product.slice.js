import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const initialState = {
    products: [],
    currentProduct: null,
    variants: [],
    loading: false,
    error: null,
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/product/get-all');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'product/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/product/get-by-id/${id}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                '/product/create',
                productData
            );
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(
                `/product/update/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/product/delete/${id}`);
            return id;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const createProductVariant = createAsyncThunk(
    'product/createProductVariant',
    async (variantData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(
                '/product-variant/create',
                variantData
            );
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchVariantsByProductId = createAsyncThunk(
    'product/fetchVariantsByProductId',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/product-variant/get-by-product/${productId}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const updateProductVariant = createAsyncThunk(
    'product/updateProductVariant',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(
                `/product-variant/update/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deleteProductVariant = createAsyncThunk(
    'product/deleteProductVariant',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/product-variant/delete/${id}`);
            return id;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.products = action.payload?.result || action.payload?.data || [];
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch products";
            })
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload?.result || action.payload?.data || null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                const newProduct = action.payload?.result || action.payload?.data;
                if (newProduct) {
                    state.products.unshift(newProduct);
                }
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const updatedProduct = action.payload?.result || action.payload?.data;
                if (updatedProduct) {
                    const index = state.products.findIndex((p) => p._id === updatedProduct._id);
                    if (index !== -1) {
                        state.products[index] = updatedProduct;
                    }
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter((p) => p._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(fetchVariantsByProductId.fulfilled, (state, action) => {
                state.variants = action.payload?.result || action.payload?.data || [];
            })
            .addCase(createProductVariant.fulfilled, (state, action) => {
                const newVariant = action.payload?.result || action.payload?.data;
                if (newVariant) {
                    state.variants.push(newVariant);
                }
            })
            .addCase(updateProductVariant.fulfilled, (state, action) => {
                const updatedVariant = action.payload?.result || action.payload?.data;
                if (updatedVariant) {
                    const index = state.variants.findIndex((v) => v._id === updatedVariant._id);
                    if (index !== -1) {
                        state.variants[index] = updatedVariant;
                    }
                }
            })
            .addCase(deleteProductVariant.fulfilled, (state, action) => {
                state.variants = state.variants.filter((v) => v._id !== action.payload);
            });
    },
});

export const { clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
