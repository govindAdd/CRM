import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../services/axios";
import { toast } from "react-toastify";
import { resetAppState } from './actions';

// === Thunks ===

// Fetch current user
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/users/getCurrentUser");
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch current user"
      );
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Update failed"
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ oldPassword, newPassword }, thunkAPI) => {
    try {
      const res = await axios.put("/users/change-password", {
        oldPassword,
        newPassword,
      });
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Password change failed"
      );
    }
  }
);

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/users");
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Delete user
export const deleteUserById = createAsyncThunk(
  "user/deleteUserById",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.delete(`/users/${userId}`);
      return {
        userId,
        message: res.data.message || "User deleted successfully",
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

// Update user role
export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async ({ userId, newRole }, thunkAPI) => {
    try {
      const res = await axios.put(`/users/${userId}/role`, { role: newRole });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Role update failed"
      );
    }
  }
);

// Fetch departments of a user
export const fetchUserDepartments = createAsyncThunk(
  "user/fetchUserDepartments",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users/${userId}/departments`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch departments"
      );
    }
  }
);

// === Initial State ===

const initialState = {
  currentUser: null,
  users: [],
  status: "idle",
  error: null,

  updateStatus: "idle",
  updateError: null,

  allUsersStatus: "idle",
  allUsersError: null,

  userDepartments: [],
  userFromDepartments: null,
  userDepartmentsStatus: "idle",
  userDepartmentsError: null,
};

// === Slice ===

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.currentUser = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // === Fetch Current User ===
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // === Update Profile ===
      .addCase(updateProfile.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.currentUser = action.payload;
        toast.success("Profile updated successfully", {
          position: "top-right",
        });
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
        toast.error(`Update failed: ${action.payload}`, {
          position: "top-right",
        });
      })

      // === Change Password ===
      .addCase(changePassword.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.updateStatus = "succeeded";
        toast.success("Password changed successfully", {
          position: "top-right",
        });
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
        toast.error(`Password change failed: ${action.payload}`, {
          position: "top-right",
        });
      })

      // === Fetch All Users ===
      .addCase(fetchAllUsers.pending, (state) => {
        state.allUsersStatus = "loading";
        state.allUsersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsersStatus = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.allUsersStatus = "failed";
        state.allUsersError = action.payload;
      })

      // === Delete User ===
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user._id !== action.payload.userId
        );
        toast.success(action.payload.message, { position: "top-right" });
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        toast.error(`Delete failed: ${action.payload}`, {
          position: "top-right",
        });
      })

      // === Update User Role ===
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload;
        state.users = state.users.map((u) =>
          u._id === updated._id ? updated : u
        );
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        toast.error(`Failed to update role: ${action.payload}`, {
          position: "top-right",
        });
      })

      // === Fetch User Departments ===
      .addCase(fetchUserDepartments.pending, (state) => {
        state.userDepartmentsStatus = "loading";
        state.userDepartmentsError = null;
      })
      .addCase(fetchUserDepartments.fulfilled, (state, action) => {
        state.userDepartmentsStatus = "succeeded";
        state.userDepartments = action.payload.departments || []; // ✅ Fix here
        state.userFromDepartments = action.payload.user || null; // ✅ Include user if needed
      })
      .addCase(fetchUserDepartments.rejected, (state, action) => {
        state.userDepartmentsStatus = "failed";
        state.userDepartmentsError = action.payload;
        toast.error(`Failed to load departments: ${action.payload}`, {
          position: "top-right",
        });
      })
      // Reset App State on logout
      .addCase(resetAppState, () => initialState);
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
