import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../services/axios';

// ========== ASYNC THUNKS ==========

// Register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/users/login', credentials);
      return response.data?.data?.user;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/users/logout');
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Logout failed.'
      );
    }
  }
);

// Forgot Password
export const forgotPasswordUser = createAsyncThunk(
  'auth/forgotPasswordUser',
  async (email, { rejectWithValue }) => {
    try {
      const res = await axios.post('/users/forgot-password', { email });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to send reset email'
      );
    }
  }
);

// Reset Password
export const resetPasswordUser = createAsyncThunk(
  'auth/resetPasswordUser',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/users/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Reset failed'
      );
    }
  }
);

// ========== SLICE ==========

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
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
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
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
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      });
  },
});

export const { setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;
