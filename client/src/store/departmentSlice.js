import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../services/axios";
import { toast } from "react-toastify";

// ========== Async Thunks ==========

// 1. Create Department
export const createDepartment = createAsyncThunk(
  "department/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/departments", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error creating department");
    }
  }
);

// 2. Get All Departments
export const fetchAllDepartments = createAsyncThunk(
  "department/fetchAll",
  async (
    { page = 1, limit = 10, search = "", sortBy = "name", sortOrder = "asc" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ page, limit, search, sortBy, sortOrder });
      const res = await axios.get(`/departments?${params}`);

      // ⛏️ FIX: No `res.data.data`, it's directly res.data
      const { results, total, page: currentPage, limit: currentLimit } = res.data.data;
      return {
        departments: results,
        totalCount: total,
        page: currentPage,
        limit: currentLimit,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching departments");
    }
  }
);

// 3. Get Department by ID
export const fetchDepartmentById = createAsyncThunk(
  "department/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/departments/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching department");
    }
  }
);

// 4. Update Department
export const updateDepartment = createAsyncThunk(
  "department/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/departments/${id}`, updates);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error updating department");
    }
  }
);

// 5. Delete Department
export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/departments/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error deleting department");
    }
  }
);

// 6. Assign Member
export const assignDepartmentMember = createAsyncThunk(
  "department/assignMember",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/departments/${id}/assign`, { userId });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error assigning member");
    }
  }
);

// 7. Remove Member
export const removeDepartmentMember = createAsyncThunk(
  "department/removeMember",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/departments/${id}/remove`, { userId });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error removing member");
    }
  }
);

// ========== Initial State ==========
const initialState = {
  departments: [],
  totalCount: 0,
  selectedDepartment: null,
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle",
  deleteStatus: "idle",
};

// ========== Slice ==========
const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createDepartment.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.departments = [action.payload, ...(state.departments || [])]; // fix
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })

      // FETCH ALL
      .addCase(fetchAllDepartments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.departments = action.payload.departments || [];
        state.totalCount = action.payload.totalCount || 0;
      })
      .addCase(fetchAllDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // GET BY ID
      .addCase(fetchDepartmentById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateDepartment.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.departments.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.departments[index] = action.payload;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteDepartment.pending, (state) => {
        state.deleteStatus = "loading";
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.departments = state.departments.filter((d) => d._id !== action.meta.arg);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      })

      // ASSIGN MEMBER
      .addCase(assignDepartmentMember.fulfilled, (state, action) => {
        const index = state.departments.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.departments[index] = action.payload;
      })

      // REMOVE MEMBER
      .addCase(removeDepartmentMember.fulfilled, (state, action) => {
        const index = state.departments.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.departments[index] = action.payload;
      });
  },
});

export const { resetCreateStatus, clearSelectedDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
