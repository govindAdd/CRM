import express from "express";
import {
  createJobApplication,
  checkDuplicateApplication,
  moveToNextStage,
  addStageNote,
  rejectAtStage,
  rollbackStage,
  markAsHired,
  markAsNotHired,
  addEvaluationAndRating,
  archiveApplication,
  unarchiveApplication,
  blockCandidate,
  unblockCandidate,
  searchJobApplications,
} from "../controllers/jobApplication.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleBasedAccess } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// 🔍 Search job applications (with pagination, filters, export)
router.get(
  "/search",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  searchJobApplications
);

// 🚀 Create a new job application
router.post(
  "/",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  upload.fields([{ name: "resumeUrl", maxCount: 1 }]),
  createJobApplication
);

// 🧠 Check if email or phone is duplicate
router.get(
  "/check-duplicate",
  verifyJWT,
  checkDuplicateApplication
);

// 🔄 Move to next stage
router.patch(
  "/:id/move-stage",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  moveToNextStage
);

// 📝 Add stage note
router.patch(
  "/:id/stage-note",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  addStageNote
);

// ❌ Reject at current stage
router.patch(
  "/:id/reject",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  rejectAtStage
);

// ↩️ Rollback to previous stage
router.patch(
  "/:id/rollback",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  rollbackStage
);

// ✅ Mark as hired and create user account
router.patch(
  "/:id/hire",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  markAsHired
);

// ❎ Mark as not hired
router.patch(
  "/:id/not-hired",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  markAsNotHired
);

// 🧾 Add evaluation and rating
router.patch(
  "/:id/evaluation",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  addEvaluationAndRating
);

// 📦 Archive application
router.patch(
  "/:id/archive",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  archiveApplication
);

// 📤 Unarchive application
router.patch(
  "/:id/unarchive",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  unarchiveApplication
);

// 🔒 Block candidate
router.patch(
  "/:id/block",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  blockCandidate
);

// 🔓 Unblock candidate
router.patch(
  "/:id/unblock",
  verifyJWT,
  roleBasedAccess("hr", "manager", "admin", "superadmin"),
  unblockCandidate
);

export default router;
