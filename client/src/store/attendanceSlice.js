// features/attendance/attendanceSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../services/axios';
import { toast } from 'react-toastify';

// === Thunks ===

// ✅ Create new attendance
export const createAttendance = createAsyncThunk(
  'attendance/createAttendance',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/attendance', attendanceData);
      toast.success('✅ Attendance created successfully!');
      return response.data.data; // populated attendance
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create attendance';
      toast.error(`❌ ${message}`);
      return rejectWithValue(message);
    }
  }
);

// === Slice ===

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    isLoading: false,
    attendance: null,
    error: null,
  },
  reducers: {
    resetAttendanceState: (state) => {
      state.isLoading = false;
      state.attendance = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendance = action.payload;
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { resetAttendanceState } = attendanceSlice.actions;

export default attendanceSlice.reducer;
