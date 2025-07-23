import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";

// ========== Async Thunks ========== //

// Create Leave Request
export const createLeaveRequest = createAsyncThunk(
  "leave/create",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      data.type = data.type?.toLowerCase();
      if (data.type === "week-off") data.to = data.from;
      const res = await api.post(`/hr/${id}/leave`, data);
      return res.data.data || null;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Approve Leave Request
export const approveLeaveRequest = createAsyncThunk(
  "leave/approveLeaveRequest",
  async ({ id, leaveIndex }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/hr/${id}/leave/${leaveIndex}/approve`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to approve leave");
    }
  }
);

// Reject Leave Request
export const rejectLeaveRequest = createAsyncThunk(
  "leave/rejectLeaveRequest",
  async ({ id, leaveIndex }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/hr/${id}/leave/${leaveIndex}/reject`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Update Leave Request
export const updateLeaveRequest = createAsyncThunk(
  "leave/update",
  async ({ id, leaveIndex, data }, { rejectWithValue }) => {
    try {
      data.type = data.type?.toLowerCase();
      if (data.type === "week-off") data.to = data.from;
      const res = await api.put(`/hr/${id}/leave/${leaveIndex}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Delete Leave Request
export const deleteLeaveRequest = createAsyncThunk(
  "leave/delete",
  async ({ id, leaveIndex }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/hr/${id}/leave/${leaveIndex}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get leave requests created by employees for admin approval
export const getAllLeaveRequestsForApproval = createAsyncThunk(
  "leave/getCreatedRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/getAllLeaveRequestsForApproval`);
      return res.data.leaveRequests;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get all leave requests (for leave management screen)
export const getAllLeaveRequests = createAsyncThunk(
  "leave/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/leaves");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get only pending leave requests
export const getPendingLeaveRequests = createAsyncThunk(
  "leave/getPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/leaves/pending");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get leave requests admin is responsible to approve
export const getLeaveRequestsForApproval = createAsyncThunk(
  "leave/getForApproval",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/leaves/for-approval");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get leave history of a specific employee
export const getEmployeeLeaveHistory = createAsyncThunk(
  "leave/getHistory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/${id}/leave/history`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get leave requests by type (sick, casual, etc.)
export const getLeaveRequestsByType = createAsyncThunk(
  "leave/getByType",
  async (type, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/leaves/type/${type}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get leave requests by date range (e.g., for reports)
export const getLeaveRequestsInDateRange = createAsyncThunk(
  "leave/getByDateRange",
  async (query, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/leaves/date-range?${query}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// Get summary of leave status (approved, rejected, pending)
export const getLeaveSummaryByStatus = createAsyncThunk(
  "leave/getSummary",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/${id}/leave/summary`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Something went wrong" });
    }
  }
);

// ========== Initial State ========== //
const initialState = {
  allLeaves: [],
  pendingLeaves: [],
  leaveHistory: [],
  summary: {},
  byType: [],
  byDateRange: [],
  forApproval: [],
  createdRequests: [],
  status: {
    loading: false,
    success: false,
    error: null,
  },
};

// ========== Slice ========== //
const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    resetLeaveStatus(state) {
      state.status = { loading: false, success: false, error: null };
    },
    clearLeaveData(state) {
      state.allLeaves = [];
      state.pendingLeaves = [];
      state.leaveHistory = [];
      state.summary = {};
      state.byType = [];
      state.byDateRange = [];
      state.forApproval = [];
      state.createdRequests = [];
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
      .addCase(getLeaveRequestsForApproval.fulfilled, (state, action) => {
        state.forApproval = action.payload;
      })
      .addCase(getEmployeeLeaveHistory.fulfilled, (state, action) => {
        state.leaveHistory = action.payload;
      })
      .addCase(getLeaveRequestsByType.fulfilled, (state, action) => {
        state.byType = action.payload;
      })
      .addCase(getLeaveRequestsInDateRange.fulfilled, (state, action) => {
        state.byDateRange = action.payload;
      })
      .addCase(getLeaveSummaryByStatus.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(getAllLeaveRequestsForApproval.fulfilled, (state, action) => {
        state.createdRequests = action.payload;
      })

      // Approve Leave
      .addCase(approveLeaveRequest.fulfilled, (state, action) => {
        const updated = action.payload;
         if (!updated || !updated._id) return;
        const indexInCreated = state.createdRequests.findIndex(req => req._id === updated._id);
        if (indexInCreated !== -1) {
          state.createdRequests[indexInCreated] = updated;
        }

        const indexInApproval = state.forApproval.findIndex(req => req._id === updated._id);
        if (indexInApproval !== -1) {
          state.forApproval[indexInApproval] = updated;
        }
      })

      // Reject Leave
      .addCase(rejectLeaveRequest.fulfilled, (state, action) => {
        const updated = action.payload;

        const indexInCreated = state.createdRequests.findIndex(req => req._id === updated._id);
        if (indexInCreated !== -1) {
          state.createdRequests[indexInCreated] = updated;
        }

        const indexInApproval = state.forApproval.findIndex(req => req._id === updated._id);
        if (indexInApproval !== -1) {
          state.forApproval[indexInApproval] = updated;
        }
      })

      // Global Matchers
      .addMatcher(
        (action) => action.type.startsWith("leave/") && action.type.endsWith("/pending"),
        (state) => {
          state.status.loading = true;
          state.status.success = false;
          state.status.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("leave/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.status.loading = false;
          state.status.success = true;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("leave/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status.loading = false;
          state.status.success = false;
          state.status.error = action.payload?.message || "An error occurred";
        }
      );
  },
});

export const { resetLeaveStatus, clearLeaveData } = leaveSlice.actions;
export default leaveSlice.reducer;
