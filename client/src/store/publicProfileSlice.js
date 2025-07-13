// features/publicProfile/publicProfileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";

export const fetchPublicProfile = createAsyncThunk(
  "publicProfile/fetchPublicProfile",
  async (username, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/user/${username}`);
      return res.data.data; // { employee, hr }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error loading profile");
    }
  }
);

const publicProfileSlice = createSlice({
  name: "publicProfile",
  initialState: {
    loading: false,
    error: null,
    employee: null,
    hr: null,
  },
  reducers: {
    clearPublicProfile: (state) => {
      state.employee = null;
      state.hr = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload.employee;
        state.hr = action.payload.hr;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearPublicProfile } = publicProfileSlice.actions;
export default publicProfileSlice.reducer;
