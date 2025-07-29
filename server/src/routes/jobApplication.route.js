import express from "express";
import {
  createJobApplication,
  checkDuplicateApplication,
  moveToNextStage,
  addStageNote,
  rejectAtStage,
  rollbackStage,
  markAsHired,
} from "../controllers/jobApplication.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";

const router = express.Router();

// ====================== PROTECTED ROUTES ======================

// 🚀 Create new job application (HR or Manager)
router.post("/", verifyJWT, createJobApplication);

// 🧠 Check for duplicates (email/phone) before submission
router.get("/check-duplicate", verifyJWT, checkDuplicateApplication);

// 🔄 Move application to next stage
router.patch("/:id/move-stage", verifyJWT, moveToNextStage);

// 📝 Add note to current stage
router.patch("/:id/stage-note", verifyJWT, addStageNote);

// ❌ Reject candidate at current stage
router.patch("/:id/reject", verifyJWT, rejectAtStage);

// ↩️ Rollback to previous stage
router.patch("/:id/rollback", verifyJWT, rollbackStage);

// ✅ Mark candidate as hired and create user account
router.patch("/:id/hire", verifyJWT, markAsHired);

// You can optionally add role restrictions like:
// roleBasedAccess("hr", "manager", "admin")

export default router;
