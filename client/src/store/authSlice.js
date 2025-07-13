import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/axios';
import { resetAppState } from './actions';

// ========== ASYNC THUNKS ==========

// Register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Registration failed');
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/login', credentials);
      const { accessToken, user } = res.data?.data || {};

      if (accessToken) {
        localStorage.setItem('authToken', accessToken); // ✅ Store access token only
      }

      return user;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Login failed');
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/users/logout'); // Refresh token is cleared server-side

      localStorage.removeItem('authToken'); // ✅ Clear access token
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Logout failed');
    }
  }
);

// Forgot Password
export const forgotPasswordUser = createAsyncThunk(
  'auth/forgotPasswordUser',
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/forgot-password', { email });
      return res.data?.message;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to send reset email');
    }
  }
);

// Reset Password
export const resetPasswordUser = createAsyncThunk(
  'auth/resetPasswordUser',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/users/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      return res.data?.message;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Reset failed');
    }
  }
);

// ===================== SLICE =====================

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isInitializing: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.isInitializing = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitializing = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.isInitializing = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.isInitializing = false;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.isInitializing = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.isInitializing = false;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.isInitializing = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitializing = false;
      })

      // Forgot Password
      .addCase(forgotPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset entire state
      .addCase(resetAppState, () => ({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isInitializing: true,
      }));
  },
});

// ===================== EXPORTS =====================
export const { setUser, clearUser, clearError, setInitializing } = authSlice.actions;
export default authSlice.reducer;
