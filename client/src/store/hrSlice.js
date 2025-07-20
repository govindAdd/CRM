// src/store/hrSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";

// ====================== Async Thunks ====================== //

// HR Management
export const createHRRecord = createAsyncThunk(
  "hr/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/hr", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateHRRecord = createAsyncThunk(
  "hr/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/hr/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const deleteHRRecord = createAsyncThunk(
  "hr/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/hr/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const restoreHRRecord = createAsyncThunk(
  "hr/restore",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/hr/${id}/restore`);
      return res.data.data;
    } catch (err) {
      const fallbackMessage = "Failed to restore HR record.";
      const errorData = err.response?.data;
      return rejectWithValue({
        message: errorData?.message || fallbackMessage,
        status: err.response?.status || 500,
      });
    }
  }
);

export const getAllHRRecords = createAsyncThunk(
  "hr/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getHRByEmployeeId = createAsyncThunk(
  "hr/getByEmployee",
  async (employeeId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/employee/${employeeId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const bulkUpdateHRRecords = createAsyncThunk(
  "hr/bulkUpdate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.patch("/hr/bulk", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const searchHRRecords = createAsyncThunk(
  "hr/search",
  async (query, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/search?${query}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Search failed" }
      );
    }
  }
);

export const exportHRData = createAsyncThunk(
  "hr/export",
  async (format = "excel", { rejectWithValue }) => {
    try {
      const res = await api.get(`/hr/export?format=${format}`, {
        responseType: "blob",
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Onboarding
export const startOnboarding = createAsyncThunk(
  "hr/startOnboarding",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/hr/${id}/onboarding/start`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateOnboardingStatus = createAsyncThunk(
  "hr/updateOnboardingStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/hr/${id}/onboarding/status`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getOnboardingEmployees = createAsyncThunk(
  "hr/getOnboarding",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/onboarding/in-progress");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Resignation
export const submitResignation = createAsyncThunk(
  "hr/submitResignation",
  async ({ id, noticePeriod }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/hr/${id}/resignation`, { noticePeriod });
      return res.data.data;
    } catch (err) {
      const fallbackMessage = "Failed to submit resignation.";
      const errorData = err.response?.data;
      return rejectWithValue({
        message: errorData?.message || fallbackMessage,
        status: err.response?.status || 500,
      });
    }
  }
);

export const updateResignationStatus = createAsyncThunk(
  "hr/updateResignation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/hr/${id}/resignation/status`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getResignedEmployees = createAsyncThunk(
  "hr/getResigned",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/resigned");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getActiveNoticePeriods = createAsyncThunk(
  "hr/getNoticePeriods",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/notice-period");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// SuperAdmins & Actives
export const getSuperAdmins = createAsyncThunk(
  "hr/getSuperAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hr/superadmins");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const getActiveEmployees = createAsyncThunk(
  "hr/getActiveEmployees",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/hr/active?${query}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ====================== Slice ====================== //

const hrSlice = createSlice({
  name: "hr",
  initialState: {
    hrRecords: [],
    searchResults: [],
    selectedHR: null,
    loading: false,
    error: null,
    onboarding: [],
    resigned: [],
    noticePeriods: [],
    superAdmins: [],
    activeEmployees: [],
  },
  reducers: {
    clearHRState: (state) => {
      state.hrRecords = [];
      state.searchResults = [];
      state.selectedHR = null;
      state.onboarding = [];
      state.resigned = [];
      state.noticePeriods = [];
      state.superAdmins = [];
      state.activeEmployees = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllHRRecords.fulfilled, (state, action) => {
        state.hrRecords = action.payload.records || action.payload;
      })
      .addCase(updateHRRecord.fulfilled, (state, action) => {
        const index = state.hrRecords.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) state.hrRecords[index] = action.payload;
      })
      .addCase(deleteHRRecord.fulfilled, (state, action) => {
        const index = state.hrRecords.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) state.hrRecords[index].isDeleted = true;
      })
      .addCase(restoreHRRecord.fulfilled, (state, action) => {
        const index = state.hrRecords.findIndex(
          (r) => r._id === action.payload._id
        );
        if (index !== -1) state.hrRecords[index].isDeleted = false;
      })
      .addCase(searchHRRecords.pending, (state) => {
        state.searchResults = [];
      })
      .addCase(searchHRRecords.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(getHRByEmployeeId.fulfilled, (state, action) => {
        state.selectedHR = action.payload;
      })
      .addCase(getOnboardingEmployees.fulfilled, (state, action) => {
        state.onboarding = action.payload;
      })
      .addCase(submitResignation.fulfilled, (state, action) => {
        const index = state.hrRecords.findIndex(
          (emp) => emp._id === action.payload._id
        );
        if (index !== -1) {
          state.hrRecords[index] = {
            ...state.hrRecords[index],
            ...action.payload,
          };
        }
        const exists = state.resigned.some(
          (emp) => emp._id === action.payload._id
        );
        if (!exists) state.resigned.push(action.payload);
      })
      .addCase(getResignedEmployees.fulfilled, (state, action) => {
        state.resigned = action.payload;
      })
      .addCase(getActiveNoticePeriods.fulfilled, (state, action) => {
        state.noticePeriods = action.payload;
      })
      .addCase(getSuperAdmins.fulfilled, (state, action) => {
        state.superAdmins = action.payload;
      })
      .addCase(getActiveEmployees.fulfilled, (state, action) => {
        state.activeEmployees = action.payload;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("hr/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("hr/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("hr/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || "Something went wrong";
        }
      );
  },
});

export const { clearHRState } = hrSlice.actions;
export default hrSlice.reducer;