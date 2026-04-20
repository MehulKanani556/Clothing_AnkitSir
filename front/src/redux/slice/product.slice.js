import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const initialState = {
    products: [],
    currentProduct: null,
    variants: [],
    collectionProducts: [],
    pagination: null,
    filterOptions: null,
    recentlyViewed: [],
    wishlist: [],
    loading: false,
    error: null,
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const fetchFilterOptions = createAsyncThunk(
    'product/fetchFilterOptions',
    async ({ mainCategorySlug, categorySlug, subCategorySlug } = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (mainCategorySlug) params.append('mainCategorySlug', mainCategorySlug);
            if (categorySlug) params.append('categorySlug', categorySlug);
            if (subCategorySlug) params.append('subCategorySlug', subCategorySlug);
            const response = await axiosInstance.get(`/product/filter-options?${params.toString()}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchProductsByCategory = createAsyncThunk(
    'product/fetchProductsByCategory',
    async ({ mainCategorySlug, categorySlug, subCategorySlug, page = 1, limit = 12, sort = 'newest' } = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (mainCategorySlug) params.append('mainCategorySlug', mainCategorySlug);
            if (categorySlug) params.append('categorySlug', categorySlug);
            if (subCategorySlug) params.append('subCategorySlug', subCategorySlug);
            params.append('page', page);
            params.append('limit', limit);
            params.append('sort', sort);
            const response = await axiosInstance.get(`/product/by-category?${params.toString()}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

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

export const fetchProductBySlug = createAsyncThunk(
    'product/fetchProductBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/product/get-by-slug/${slug}`);
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

export const addRecentlyViewed = createAsyncThunk(
    'product/addRecentlyViewed',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/recently-viewed/add', { productId });
            return response.data;
        } catch (error) {
            // If user is not logged in, we can handle it in the component or here by using localStorage
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchRecentlyViewed = createAsyncThunk(
    'product/fetchRecentlyViewed',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/user/recently-viewed/my');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const toggleWishlist = createAsyncThunk(
    'product/toggleWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/wishlist/toggle', { productId });
            return { productId, ...response.data };
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchWishlist = createAsyncThunk(
    'product/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/user/wishlist/my');
            return response.data;
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
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.collectionProducts = action.payload?.result?.products || action.payload?.data?.products || [];
                state.pagination = action.payload?.result?.pagination || action.payload?.data?.pagination || null;
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch products";
            })
            .addCase(fetchFilterOptions.fulfilled, (state, action) => {
                state.filterOptions = action.payload?.result || action.payload?.data || null;
            })
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
            .addCase(fetchProductBySlug.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProductBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload?.result || action.payload?.data || null;
            })
            .addCase(fetchProductBySlug.rejected, (state, action) => {
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
            })
            .addCase(fetchRecentlyViewed.fulfilled, (state, action) => {
                state.recentlyViewed = action.payload?.result || action.payload?.data || [];
            })
            .addCase(addRecentlyViewed.fulfilled, (state, action) => {
                // but we need the actual product objects for the UI.
                // So fetchRecentlyViewed is more useful.
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                const items = action.payload?.result?.items || action.payload?.data?.items || action.payload?.result || action.payload?.data || [];
                // If the backend returns populated items [{ productId: {...} }], map them to just products
                state.wishlist = Array.isArray(items) ? items.map(item => item.productId || item) : [];
            })
            .addCase(toggleWishlist.pending, (state, action) => {
                const productId = action.meta.arg;
                if (!Array.isArray(state.wishlist)) state.wishlist = [];
                const exists = state.wishlist.some(p => (p._id || p) === productId);
                if (exists) {
                    state.wishlist = state.wishlist.filter(p => (p._id || p) !== productId);
                } else {
                    // Try to find full product data in local state first
                    const product = state.products.find(p => p._id === productId) || 
                                  state.collectionProducts.find(p => p._id === productId) ||
                                  state.recentlyViewed.find(p => p._id === productId) ||
                                  state.currentProduct;
                    
                    if (product && (product._id || product) === productId) {
                        state.wishlist.push(product);
                    } else {
                        state.wishlist.push({ _id: productId });
                    }
                }
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                const productId = action.meta.arg;
                const isWishlisted = action.payload?.result?.isWishlisted ?? action.payload?.isWishlisted;
                
                if (isWishlisted === false) {
                    state.wishlist = state.wishlist.filter(p => (p._id || p) !== productId);
                } else if (isWishlisted === true) {
                    // Check if we only have a skeletal object
                    const existingIndex = state.wishlist.findIndex(p => (p._id || p) === productId);
                    const isSkeletal = existingIndex !== -1 && !state.wishlist[existingIndex].name;

                    if (existingIndex === -1 || isSkeletal) {
                        const product = state.products.find(p => p._id === productId) || 
                                      state.collectionProducts.find(p => p._id === productId) ||
                                      state.recentlyViewed.find(p => p._id === productId) ||
                                      state.currentProduct;
                        
                        if (product && (product._id || product) === productId) {
                            if (existingIndex !== -1) {
                                state.wishlist[existingIndex] = product;
                            } else {
                                state.wishlist.push(product);
                            }
                        }
                    }
                }
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                // Revert optimistic update if the API call fails
                const productId = action.meta.arg;
                // This is slightly tricky without knowing if we added or removed.
                // But generally, fetchWishlist is usually triggered on error to stay in sync.
            });
    },
});

export const { clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
