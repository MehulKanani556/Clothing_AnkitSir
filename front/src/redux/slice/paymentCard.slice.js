import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const initialState = {
    cards: [],
    selectedCardId: null,
    loading: false,
    actionLoading: false,
    error: null,
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// Fetch all saved cards
export const fetchSavedCards = createAsyncThunk(
    'payment/fetchSavedCards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/user/saved-cards');
       
            return response.data?.result;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Add new card (for manual card addition - not used in Stripe flow)
export const addSavedCard = createAsyncThunk(
    'payment/addSavedCard',
    async ({ cardData, setAsDefault = false }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/card/save', cardData);
            
            // Refresh the cards list
            const refreshResp = await axiosInstance.get('/user/saved-cards');
            return refreshResp.data?.result;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Add new card using Stripe Payment Method
export const addSavedCardStripe = createAsyncThunk(
    'payment/addSavedCardStripe',
    async (paymentMethodId, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/user/card/save-stripe', { paymentMethodId });
            
            // Refresh the cards list
            const refreshResp = await axiosInstance.get('/user/saved-cards');
            return refreshResp.data?.result;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Delete card
export const deleteSavedCard = createAsyncThunk(
    'payment/deleteSavedCard',
    async (cardId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/user/card/delete/${cardId}`);
            const refreshResp = await axiosInstance.get('/user/saved-cards');
            return refreshResp.data?.result;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Set default card (for selecting which card to use)
export const selectCard = createAsyncThunk(
    'payment/selectCard',
    async (cardId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/user/card/select/${cardId}`);
            return response.data?.result;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchSavedCards
            .addCase(fetchSavedCards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSavedCards.fulfilled, (state, action) => {
                state.loading = false;
                state.cards = action.payload || [];
                state.selectedCardId = action.payload?.find(c => c.isDefault)?._id || null;
            })
            .addCase(fetchSavedCards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch saved cards';
            })

            // addSavedCard
            .addCase(addSavedCard.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(addSavedCard.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.cards = action.payload || [];
                state.selectedCardId = action.payload?.find(c => c.isDefault)?._id || null;
                toast.success('Card added successfully');
            })
            .addCase(addSavedCard.rejected, (state, action) => {
                state.actionLoading = false;
                toast.error(action.payload?.message || 'Failed to add card');
            })

            // addSavedCardStripe
            .addCase(addSavedCardStripe.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(addSavedCardStripe.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.cards = action.payload || [];
                toast.success('Card saved successfully');
            })
            .addCase(addSavedCardStripe.rejected, (state, action) => {
                state.actionLoading = false;
                toast.error(action.payload?.message || 'Failed to save card');
            })

            // deleteSavedCard
            .addCase(deleteSavedCard.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(deleteSavedCard.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.cards = action.payload || [];
                state.selectedCardId = action.payload?.find(c => c.isDefault)?._id || null;
                toast.success('Card removed');
            })
            .addCase(deleteSavedCard.rejected, (state, action) => {
                state.actionLoading = false;
                toast.error(action.payload?.message || 'Failed to delete card');
            })

            // selectCard
            .addCase(selectCard.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(selectCard.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.cards = action.payload || [];
                state.selectedCardId = action.payload?.find(c => c.isDefault)?._id || null;
                toast.success('Default card updated');
            })
            .addCase(selectCard.rejected, (state, action) => {
                state.actionLoading = false;
                toast.error(action.payload?.message || 'Failed to set default card');
            });
    },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
