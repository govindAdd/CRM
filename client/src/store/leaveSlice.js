import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";

// =================== Thunks =================== //

export const createLeaveRequest = createAsyncThunk("leave/create", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/hr/${id}/leave`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const updateLeaveRequest = createAsyncThunk("leave/update", async ({ id, leaveIndex, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/hr/${id}/leave/${leaveIndex}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const deleteLeaveRequest = createAsyncThunk("leave/delete", async ({ id, leaveIndex }, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/hr/${id}/leave/${leaveIndex}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const approveLeaveRequest = createAsyncThunk("leave/approve", async ({ id, leaveIndex }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/hr/${id}/leave/${leaveIndex}/approve`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const rejectLeaveRequest = createAsyncThunk("leave/reject", async ({ id, leaveIndex }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/hr/${id}/leave/${leaveIndex}/reject`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getEmployeeLeaveHistory = createAsyncThunk("leave/history", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/hr/${id}/leave/history`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getAllLeaveRequests = createAsyncThunk("leave/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/hr/leaves");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getPendingLeaveRequests = createAsyncThunk("leave/pending", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/hr/leaves/pending");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getLeaveRequestsByType = createAsyncThunk("leave/byType", async (type, { rejectWithValue }) => {
  try {
    const res = await api.get(`/hr/leaves/type/${type}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getLeaveRequestsInDateRange = createAsyncThunk("leave/byDateRange", async (query, { rejectWithValue }) => {
  try {
    const res = await api.get(`/hr/leaves/date-range?${query}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getLeaveSummaryByStatus = createAsyncThunk("leave/summary", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/hr/${id}/leave/summary`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const getLeaveRequestsForApproval = createAsyncThunk("leave/forApproval", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/hr/leaves/for-approval");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// =================== Slice =================== //

const leaveSlice = createSlice({
  name: "leave",
  initialState: {
    allLeaves: [],
    pendingLeaves: [],
    leaveHistory: [],
    summary: {},
    byType: [],
    byDateRange: [],
    forApproval: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearLeaveState: (state) => {
      state.allLeaves = [];
      state.pendingLeaves = [];
      state.leaveHistory = [];
      state.summary = {};
      state.byType = [];
      state.byDateRange = [];
      state.forApproval = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLeaveRequests.fulfilled, (state, action) => {
        state.allLeaves = action.payload;
      })
      .addCase(getPendingLeaveRequests.fulfilled, (state, action) => {
        state.pendingLeaves = action.payload;
      })
      .addCase(getEmployeeLeaveHistory.fulfilled, (state, action) => {
        state.leaveHistory = action.payload;
      })
      .addCase(getLeaveSummaryByStatus.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(getLeaveRequestsByType.fulfilled, (state, action) => {
        state.byType = action.payload;
      })
      .addCase(getLeaveRequestsInDateRange.fulfilled, (state, action) => {
        state.byDateRange = action.payload;
      })
      .addCase(getLeaveRequestsForApproval.fulfilled, (state, action) => {
        state.forApproval = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith("leave/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("leave/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("leave/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || "Something went wrong";
        }
      );
  },
});

export const { clearLeaveState } = leaveSlice.actions;
export default leaveSlice.reducer;
