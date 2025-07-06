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
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// ============================ Protected Routes ============================
router.get("/getCurrentUser", verifyJWT, getCurrentUser);
router.post("/logout", verifyJWT, logoutUser);
router.put(
  "/profile",
  verifyJWT,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateProfile
);
router.put("/change-password", verifyJWT, changeCurrentPassword);

// ============================ Admin Routes ============================
router.get("/", verifyJWT, roleBasedAccess("admin", "superadmin"), getAllUsers);
router.put(
  "/:id/role",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  updateUserRole
);
// routes/user.routes.js or similar
router.delete(
  "/:id",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  deleteUser
);

// ============================ Public Routes ============================
router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
); //
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordForget);
router.post("/reset-password/:token", resetPassword);
router.get("/:username", getPublicUserProfile);

export default router;
