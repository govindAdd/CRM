import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import api from "../services/axios";

// ==================== ASYNC THUNKS ====================

export const searchJobApplications = createAsyncThunk(
  "jobApplication/search",
  async (searchParams, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const { data } = await api.get(`/api/job-applications/search?${query}`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Search failed",
      });
    }
  }
);

export const createJobApplication = createAsyncThunk(
  "jobApplication/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/job-applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Create failed",
      });
    }
  }
);

export const checkDuplicateApplication = createAsyncThunk(
  "jobApplication/checkDuplicate",
  async ({ phone, email }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/job-applications/check-duplicate", {
        params: { phone, email },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Duplicate check failed",
      });
    }
  }
);

export const moveToNextStage = createAsyncThunk(
  "jobApplication/moveToNextStage",
  async ({ id, nextStage, notes }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/job-applications/${id}/move-stage`, {
        nextStage,
        notes,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Move stage failed",
      });
    }
  }
);

export const rejectAtStage = createAsyncThunk(
  "jobApplication/rejectAtStage",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/reject`, {
        reason,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Reject failed",
      });
    }
  }
);

export const rollbackStage = createAsyncThunk(
  "jobApplication/rollbackStage",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/rollback`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Rollback failed",
      });
    }
  }
);

export const markAsHired = createAsyncThunk(
  "jobApplication/markAsHired",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/hired`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Hired failed",
      });
    }
  }
);

export const markAsNotHired = createAsyncThunk(
  "jobApplication/markAsNotHired",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/not-hired`, {
        reason,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Not hired failed",
      });
    }
  }
);

export const addEvaluationAndRating = createAsyncThunk(
  "jobApplication/addEvaluationAndRating",
  async ({ id, stage, evaluation, rating }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/evaluation`, {
        stage,
        evaluation,
        rating,
      });
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Evaluation failed",
      });
    }
  }
);

export const archiveApplication = createAsyncThunk(
  "jobApplication/archive",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/archive`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Archive failed",
      });
    }
  }
);

export const unarchiveApplication = createAsyncThunk(
  "jobApplication/unarchive",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/unarchive`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Unarchive failed",
      });
    }
  }
);

export const blockCandidate = createAsyncThunk(
  "jobApplication/blockCandidate",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/block`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Block failed",
      });
    }
  }
);

export const unblockCandidate = createAsyncThunk(
  "jobApplication/unblockCandidate",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/job-applications/${id}/unblock`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Unblock failed",
      });
    }
  }
);

export const fetchJobApplicationById = createAsyncThunk(
  "jobApplication/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/job-applications/${id}`);
      return data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Fetch failed",
      });
    }
  }
);

// ==================== SLICE ====================

const jobApplicationSlice = createSlice({
  name: "jobApplication",
  initialState: {
    loading: false,
    applications: [],
    selectedApplication: null,
    error: null,
  },
  reducers: {
    clearJobApplicationState: (state) => {
      state.loading = false;
      state.applications = [];
      state.selectedApplication = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      const updated = action.payload;
      const index = state.applications.findIndex((app) => app._id === updated._id);
      if (index !== -1) {
        state.applications[index] = updated;
      } else {
        state.applications.unshift(updated);
      }
      state.loading = false;
      state.error = null;
    };

    builder
      .addCase(searchJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
        state.error = null;
      })
      .addCase(fetchJobApplicationById.fulfilled, (state, action) => {
        state.selectedApplication = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(
          createJobApplication.fulfilled,
          moveToNextStage.fulfilled,
          rejectAtStage.fulfilled,
          rollbackStage.fulfilled,
          markAsHired.fulfilled,
          markAsNotHired.fulfilled,
          addEvaluationAndRating.fulfilled,
          archiveApplication.fulfilled,
          unarchiveApplication.fulfilled,
          blockCandidate.fulfilled,
          unblockCandidate.fulfilled
        ),
        fulfilled
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("jobApplication/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("jobApplication/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || "Something went wrong";
        }
      );
  },
});

export const { clearJobApplicationState } = jobApplicationSlice.actions;
export default jobApplicationSlice.reducer;