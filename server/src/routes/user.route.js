import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
  changeCurrentPassword,
  requestPasswordForget,
  resetPassword,
  getAllUsers,
  updateUserRole,
  getPublicUserProfile,
  getCurrentUser,
  deleteUser,
  getUserDepartment,
  refreshAccessToken,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// ====================== PROTECTED ROUTES ======================
router.get("/getCurrentUser", verifyJWT, getCurrentUser);
router.post("/logout", verifyJWT, logoutUser);
router.put(
  "/profile",
  verifyJWT,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateProfile
);
router.put("/change-password", verifyJWT, changeCurrentPassword);

// ====================== ADMIN ROUTES ======================
router.get("/", verifyJWT, roleBasedAccess("admin", "superadmin"), getAllUsers);
router.put(
  "/:id/role",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  updateUserRole
);
router.delete(
  "/:id",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  deleteUser
);

// ✅ Get departments of a specific user — PLACE BEFORE /:username
router.get("/:userId/departments", verifyJWT, getUserDepartment);

// ====================== PUBLIC ROUTES ======================
router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordForget);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh", refreshAccessToken);

// ✅ PUBLIC PROFILE route — PLACE THIS LAST
router.get("/user/:username", getPublicUserProfile);

export default router;
