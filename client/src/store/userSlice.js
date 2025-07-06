import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../services/axios";

// === Thunk: Fetch current user ===
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/users/getCurrentUser");
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

// === Thunk: Update user profile ===
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

// === Thunk: Change Password ===
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

// === Thunk: Fetch all users (privileged roles only) ===
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

// === Thunk: Delete user by ID (Admin, HR, etc.) ===
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

// === Thunk: Update a user's role ===
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
const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    users: [],
    status: "idle", // for currentUser
    error: null,

    updateStatus: "idle", // for updateProfile
    updateError: null,

    allUsersStatus: "idle", // for fetchAllUsers
    allUsersError: null,
  },
  reducers: {
    clearUser: (state) => {
      state.currentUser = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder

      // ==== fetchCurrentUser ====
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

      // ==== updateProfile ====
      .addCase(updateProfile.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      })

      // ==== changePassword ====
      .addCase(changePassword.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.updateStatus = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      })

      // ==== fetchAllUsers ====
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

      // ==== deleteUserById ====
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
      // ==== updateUserRole ====
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
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
