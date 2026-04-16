import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Function to clear persisted storage
const clearPersistedStorage = () => {
    try {
        // Clear redux-persist storage
        localStorage.removeItem('persist:root');
        // Clear auth tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
    } catch (error) {
        console.error('Error clearing persisted storage:', error);
    }
};

const initialState = {
    user: null,
    isAuthenticated: false,
    isNewUser: false,   // true = just registered, false = existing user login
    loading: false,
    emailOtpLoading: false,
    error: null,
    message: null,
    otp: null, // dev only: store OTP returned from backend
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// Step 1: Send OTP (works for both login & register)
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async ({ mobileNo, role = 'user' }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/send-otp`, { mobileNo, role }, { withCredentials: true });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Step 2: Verify OTP (logs in or registers the user)
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ mobileNo, otp }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/verify-otp`, { mobileNo, otp }, { withCredentials: true });
            if (response.data?.user) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('userId', response.data.user._id);
                localStorage.setItem('role', response.data.user.role);
            }
            // Backend message: "Registered and logged in successfully" = new user
            const isNewUser = response.data?.message?.toLowerCase().includes('registered');
            return { ...response.data, isNewUser };
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
            if (response.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Get current logged-in user
export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Update profile (firstName, lastName, email)
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ firstName, lastName, email }, { rejectWithValue }) => {
        try {
            const payload = { firstName, lastName };
            if (email) payload.email = email;
            const response = await axiosInstance.put('/user/profile/update', payload);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Send email verification OTP
export const sendEmailOtp = createAsyncThunk(
    'auth/sendEmailOtp',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/email/send-otp');
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Verify email OTP
export const verifyEmailOtp = createAsyncThunk(
    'auth/verifyEmailOtp',
    async ({ otp }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/email/verify-otp', { otp });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isNewUser = false;
            state.error = null;
            state.message = null;
            state.otp = null;
            // Clear all persisted storage
            clearPersistedStorage();
        },
        clearMessage: (state) => {
            state.message = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // --- Send OTP ---
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || 'OTP sent successfully!';
                state.otp = action.payload?.otp || null; // dev only
                // existingUser is null/undefined for new users, populated for existing users
                state.isNewUser = !action.payload?.existingUser;
                toast.success(action.payload?.message || 'OTP sent successfully!');
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to send OTP';
                state.message = action.payload?.message || 'Failed to send OTP';
                toast.error(action.payload?.message || 'Failed to send OTP');
            })

            // --- Verify OTP ---
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isAuthenticated = true;
                state.user = action.payload?.user || null;
                state.message = action.payload?.message || 'Logged in successfully';
                toast.success(action.payload?.message || 'Logged in successfully!');
                // Keep isNewUser as set during sendOtp — no override needed
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || 'Invalid or expired OTP';
                state.message = action.payload?.message || 'Invalid or expired OTP';
                toast.error(action.payload?.message || 'Invalid or expired OTP');
            })

            // --- Refresh Token ---
            .addCase(refreshAccessToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshAccessToken.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload?.message || 'Session expired, please login again';
                toast.error(action.payload?.message || 'Session expired, please login again');
            })

            // --- Get Me ---
            .addCase(getMe.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload?.result || null;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload?.message || 'Failed to fetch user';
            })

            // --- Update Profile ---
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload?.result || state.user;
                state.message = action.payload?.message || 'Profile updated successfully!';
                toast.success(action.payload?.message || 'Profile updated successfully!');
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update profile';
                toast.error(action.payload?.message || 'Failed to update profile');
            })

            // --- Send Email OTP ---
            .addCase(sendEmailOtp.pending, (state) => {
                state.emailOtpLoading = true;   // ← not loading
                state.error = null;
            })
            .addCase(sendEmailOtp.fulfilled, (state, action) => {
                state.emailOtpLoading = false;
                toast.success(action.payload?.message || 'OTP sent to your email!');
            })
            .addCase(sendEmailOtp.rejected, (state, action) => {
                state.emailOtpLoading = false;
                state.error = action.payload?.message || 'Failed to send OTP';
                toast.error(action.payload?.message || 'Failed to send OTP');
            })

            // --- Verify Email OTP ---
            .addCase(verifyEmailOtp.pending, (state) => {
                state.emailOtpLoading = true;   // ← not loading
                state.error = null;
            })
            .addCase(verifyEmailOtp.fulfilled, (state, action) => {
                state.emailOtpLoading = false;
                if (state.user) state.user.emailVerified = true;
                toast.success(action.payload?.message || 'Email verified successfully!');
            })
            .addCase(verifyEmailOtp.rejected, (state, action) => {
                state.emailOtpLoading = false;
                state.error = action.payload?.message || 'Invalid or expired OTP';
                toast.error(action.payload?.message || 'Invalid or expired OTP');
            });
    },
});

export const { logout, clearMessage } = authSlice.actions;
export default authSlice.reducer;
